const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const ilanlar = require("../models/İlanlar");
const User = require('../models/User');
const Kategori = require('../models/Kategori');
const teklifler = require('../models/Teklifler');
const Mesajlar = require('../models/Mesajlar');
const Degerlendirmeler = require("../models/Degerlendirmeler");
const IlanYorum = require('../models/Yorum');
const nodemailer = require("nodemailer");
const multer = require("../multer");
const { Op } = require("sequelize");


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/profil-fotograf-guncelle', multer.single('avatar'), async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');
        if (!req.file) return res.redirect('/profil');

        const userId = req.session.user.id;
        const yeniFotografAdi = req.file.filename;

        await User.update(
            { profil_fotografi: yeniFotografAdi },
            { where: { id: userId } }
        );

        req.session.user.profil_fotografi = yeniFotografAdi;

        res.redirect('/profil');
    } catch (error) {
        console.error("Fotoğraf güncelleme hatası:", error);
        res.redirect('/profil');
    }
});

router.post('/profil-fotograf-sil', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const userId = req.session.user.id;

        await User.update(
            { profil_fotografi: null },
            { where: { id: userId } }
        );
        req.session.user.profil_fotografi = null;

        res.redirect('/profil');
    } catch (error) {
        console.error("Fotoğraf silme hatası:", error);
        res.redirect('/profil');
    }
});

router.get('/kullanici/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const profilSahibi = await User.findByPk(userId, {
            attributes: ['id', 'ad', 'soyad', 'rol', 'kayitTarihi', "profil_fotografi"]
        });

        if (!profilSahibi) {
            return res.status(404).send("Böyle bir kullanıcı bulunamadı.");
        }

        const kullaniciIlanlari = await ilanlar.findAll({
            where: { musteri_id: userId, durum: 1 },
            include: [{ model: Kategori }]
        });

        const degerlendirmeler = await Degerlendirmeler.findAll({
            where: { hizmetveren_id: userId },
            include: [{
                model: User,
                attributes: ["ad", "soyad"]
            }]
        });

        let toplamPuan = 0;
        let ortalamaPuan = "0.0";

        if (degerlendirmeler && degerlendirmeler.length > 0) {
            degerlendirmeler.forEach(d => {
                toplamPuan += d.puan || 0;
            });
            ortalamaPuan = (toplamPuan / degerlendirmeler.length).toFixed(1);
        }

        res.render('user/acik-profil', {
            profilSahibi: profilSahibi,
            ilanlar: kullaniciIlanlari,
            degerlendirmeler: degerlendirmeler,
            ortalamaPuan: ortalamaPuan
        });

    } catch (error) {
        console.error("Profil görüntüleme hatası:", error);
        res.redirect('/');
    }
});

router.post("/ilan/:id/yorum-yap", async function (req, res) {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const { yorum_metni } = req.body;
        const ilanId = req.params.id;
        const userId = req.session.user.id;

        if (yorum_metni && yorum_metni.trim() !== "") {
            await IlanYorum.create({
                yorum_metni: yorum_metni,
                ilan_id: ilanId,
                user_id: userId
            });
        }

        res.redirect(`/ilan/${ilanId}`);
    } catch (err) {
        console.log("Yorum ekleme hatası:", err);
        res.redirect(`/ilan/${req.params.id}`);
    }
});

router.post('/degerlendir/:ilanId', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const ilanId = req.params.ilanId;
        const musteriId = req.session.user.id;
        const { puan, yorum } = req.body;

        const anlasilanTeklif = await teklifler.findOne({
            where: { ilan_id: ilanId, durum: 'Kabul Edildi' }
        });

        if (!anlasilanTeklif) {
            console.log("Hata: Bu ilan için kabul edilmiş bir teklif bulunamadı.");
            return res.redirect('/profil');
        }

        await Degerlendirmeler.create({
            puan: parseInt(puan),
            yorum: yorum,
            musteri_id: musteriId,
            ilan_id: ilanId,
            hizmetveren_id: anlasilanTeklif.hizmetveren_id
        });

        await ilanlar.update(
            { durum: 4 },
            { where: { id: ilanId } }
        );

        await teklifler.update(
            { durum: 'Tamamlandı' },
            { where: { id: anlasilanTeklif.id } }
        );

        res.redirect('/profil');

    } catch (error) {
        console.log("Değerlendirme Kayıt Hatası:", error);
        res.redirect('/profil');
    }
});

router.get('/mesajlar/:ilanId', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const ilanId = req.params.ilanId;
        const userId = req.session.user.id;

        const ilan = await ilanlar.findByPk(ilanId, {
            include: [{
                model: teklifler,
                where: { durum: 'Kabul Edildi' },
                required: true
            }]
        });

        if (!ilan) {
            req.session.toastMesaj = 'Sohbet bulunamadı veya iş henüz onaylanmamış.';
            return res.redirect('/profil');
        }

        const ustaId = ilan.tekliflers[0].hizmetveren_id;
        const musteriId = ilan.musteri_id;

        if (userId !== ustaId && userId !== musteriId) {
            req.session.toastMesaj = 'Bu sohbete erişim yetkiniz yok!';
            return res.redirect('/profil');
        }
        await Mesajlar.update(
            { okundu_mu: true },
            {
                where: {
                    ilan_id: ilanId,
                    alici_id: userId,
                    okundu_mu: false
                }
            }
        );

        const sohbet = await Mesajlar.findAll({
            where: { ilan_id: ilanId },
            include: [{ model: User, as: 'gonderen', attributes: ['ad', 'soyad'] }],
            order: [['mesaj_tarihi', 'ASC']]
        });

        let karsiTarafId = (userId === musteriId) ? ustaId : musteriId;
        const karsiTaraf = await User.findByPk(karsiTarafId, { attributes: ['ad', 'soyad',"id"] });

        res.render('user/mesajlar', { sohbet, ilan, karsiTaraf, userId });

    } catch (error) {
        console.log("Mesajlar yüklenirken hata:", error);
        res.redirect('/profil');
    }
});

router.post('/mesaj-gonder/:ilanId', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const ilanId = req.params.ilanId;
        const userId = req.session.user.id;
        const { mesaj_icerik } = req.body;

        const ilan = await ilanlar.findByPk(ilanId, {
            include: [{ model: teklifler, where: { durum: 'Kabul Edildi' } }]
        });

        if (!ilan) return res.redirect('/profil');

        const ustaId = ilan.tekliflers[0].hizmetveren_id;
        const musteriId = ilan.musteri_id;

        let aliciId = (userId === musteriId) ? ustaId : musteriId;

        await Mesajlar.create({
            gonderen_id: userId,
            alici_id: aliciId,
            ilan_id: ilanId,
            mesaj: mesaj_icerik
        });

        res.redirect(`/mesajlar/${ilanId}`);

    } catch (error) {
        console.log("Mesaj gönderme hatası:", error);
        res.redirect(`/mesajlar/${req.params.ilanId}`);
    }
});

router.post('/teklif-reddet/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const teklifId = req.params.id;

        const teklif = await teklifler.findByPk(teklifId, {
            include: [{ model: ilanlar }]
        });

        if (!teklif || teklif.ilanlar.musteri_id !== req.session.user.id) {
            req.session.toastMesaj = 'Yetkisiz işlem veya teklif bulunamadı.';
            return res.redirect('/profil');
        }

        teklif.durum = 'Reddedildi';
        await teklif.save();

        req.session.toastMesaj = 'Teklif reddedildi.';
        res.redirect('/profil');

    } catch (error) {
        console.log("Teklif reddetme hatası:", error);
        res.redirect('/profil');
    }
});

router.post('/teklif-kabul/:id', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');

        const teklifId = req.params.id;

        const kazananTeklif = await teklifler.findByPk(teklifId, {
            include: [{ model: ilanlar }]
        });

        if (!kazananTeklif || kazananTeklif.ilanlar.musteri_id !== req.session.user.id) {
            req.session.toastMesaj = 'Yetkisiz işlem!';
            return res.redirect('/profil');
        }

        const ilanId = kazananTeklif.ilan_id;

        await teklifler.update(
            { durum: 'Reddedildi' },
            { where: { ilan_id: ilanId } }
        );

        kazananTeklif.durum = 'Kabul Edildi';
        await kazananTeklif.save();

        const guncellenecekIlan = kazananTeklif.ilanlar;
        guncellenecekIlan.durum = 2;
        await guncellenecekIlan.save();

        req.session.toastMesaj = 'Teklif başarıyla kabul edildi! İlanınız yayından kaldırıldı.';
        res.redirect('/profil');

    } catch (error) {
        console.log("Teklif kabul etme hatası:", error);
        res.redirect('/profil');
    }
});

router.get('/profil', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/giris');
        const userId = req.session.user.id;

        const ilanlarim = await ilanlar.findAll({
            where: { musteri_id: userId },
            include: [{
                model: teklifler,
                required: true,
                include: [{ model: User, attributes: ['ad', 'soyad'] }]
            }],
            order: [['id', 'DESC']]
        });

        const kazandigimIsler = await teklifler.findAll({
            where: {
                hizmetveren_id: userId,
                durum: 'Kabul Edildi'
            },
            include: [{
                model: ilanlar,
                include: [{ model: User, attributes: ['ad', 'soyad'] }]
            }],
            order: [['id', 'DESC']]
        });

        const alinanYorumlar = await Degerlendirmeler.findAll({
            where: { hizmetveren_id: userId },
            order: [['id', 'DESC']]
        });

        const yorumlarDetayli = await Promise.all(alinanYorumlar.map(async (yorum) => {
            const musteri = await User.findByPk(yorum.musteri_id);
            return {
                puan: yorum.puan,
                yorum: yorum.yorum,
                musteriAdSoyad: musteri ? `${musteri.ad} ${musteri.soyad}` : 'Bilinmeyen Müşteri'
            };
        }));

        let toplamPuan = 0;
        yorumlarDetayli.forEach(y => toplamPuan += y.puan);
        const ortalamaPuan = yorumlarDetayli.length > 0 ? (toplamPuan / yorumlarDetayli.length).toFixed(1) : "0.0";

        res.render('user/profil', {
            ilanlarim,
            kazandigimIsler,
            yorumlarDetayli,
            ortalamaPuan
        });

    } catch (error) {
        console.log("Profil hatası:", error);
        res.redirect('/');
    }
});

router.post('/teklif-ver/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/giris');
        }

        const ilanId = req.params.id;
        const { teklif_fiyati, mesaj } = req.body;
        const hizmetverenId = req.session.user.id;

        const ilan = await ilanlar.findByPk(ilanId);

        if (!ilan) {
            req.session.toastMesaj = 'Böyle bir ilan bulunamadı veya silinmiş.';
            return res.redirect('/');
        }

        if (ilan.musteri_id === hizmetverenId) {
            req.session.toastMesaj = 'Kendi ilanınıza teklif veremezsiniz!';
            return res.redirect(`/ilan/${ilanId}`);
        }

        await teklifler.create({
            ilan_id: ilanId,
            hizmetveren_id: hizmetverenId,
            teklif_fiyati: teklif_fiyati,
            mesaj: mesaj,
            durum: "Bekliyor"
        });

        req.session.toastMesaj = 'Teklifiniz başarıyla gönderildi!';
        res.redirect(`/ilan/${ilanId}`);

    } catch (error) {
        console.log("Teklif verme hatası:", error);
        req.session.toastMesaj = 'Teklif gönderilirken bir hata oluştu.';
        res.redirect(`/ilan/${req.params.id}`);
    }
});

router.post('/ilan-sil/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/giris');
        }

        const ilanId = req.params.id;
        const silinecekIlan = await ilanlar.findByPk(ilanId);

        if (!silinecekIlan) {
            return res.redirect('/');
        }

        if (silinecekIlan.musteri_id === req.session.user.id || req.session.user.rol === "admin") {
            await silinecekIlan.update({ durum: 3 });
            await silinecekIlan.save();
            req.session.toastMesaj = 'İlan başarıyla silindi.';
        }

        res.redirect('/');

    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/ilan-ekle', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/giris');
    }
    try {
        const tumKategoriler = await Kategori.findAll();
        res.render('user/ilan-ekle', { hata: null, kategoriler: tumKategoriler });
    } catch (error) {
        console.log("Kategori çekme hatası:", error);
        res.redirect('/');
    }
});

router.post('/ilan-ekle', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/giris');
        }

        const { baslik, aciklama, kategori_id } = req.body;

        await ilanlar.create({
            baslik: baslik,
            aciklama: aciklama,
            kategori_id: kategori_id,
            musteri_id: req.session.user.id,
            durum: req.session.user.rol === 'admin' ? 1 : 0
        });

        req.session.toastMesaj = req.session.user.rol === 'admin' ? 'İlanınız başarıyla eklendi.' : 'İlanınız onaylandıktan sonra yayınlanacaktır.';

        res.redirect('/');

    } catch (error) {
        console.log("İlan ekleme hatası:", error);
        res.render('user/ilan-ekle', { hata: 'İlan eklenirken bir hata oluştu.' });
    }
});

router.get('/yeniden-gonder', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.redirect('/kayit');

        const kullanici = await User.findOne({ where: { email: email } });

        if (!kullanici || kullanici.onaylandimi) {
            return res.redirect('/giris');
        }

        const yeniKod = Math.floor(100000 + Math.random() * 900000).toString();

        kullanici.onay_kodu = yeniKod;
        await kullanici.save();

        const mailAyarlari = {
            from: "mehmetturanemin8@gmail.com",
            to: email,
            subject: "İşbul - Yeni Doğrulama Kodunuz",
            text: `Sisteme kayıt olmak için yeni doğrulama kodunuz: ${yeniKod}`
        };

        transporter.sendMail(mailAyarlari);

        res.render('user/dogrulama', { email: email, hata: null });

    } catch (error) {
        console.log("Yeniden gönderme hatası:", error);
        res.render('user/dogrulama', { email: req.query.email, hata: 'Kod gönderilirken bir hata oluştu.' });
    }
});

router.get('/dogrulama', (req, res) => {
    const email = req.query.email;
    res.render('user/dogrulama', { email: email, hata: null });
});

router.post('/dogrulama', async (req, res) => {
    try {
        const { email, kod } = req.body;

        const kullanici = await User.findOne({ where: { email: email } });

        if (!kullanici) {
            return res.render('user/dogrulama', { email: email, hata: 'Kullanıcı bulunamadı.' });
        }

        if (kullanici.onay_kodu === kod) {
            kullanici.onaylandimi = true;
            await kullanici.save();
            req.session.toastMesaj = 'Hesabınız başarıyla doğrulandı, şimdi giriş yapabilirsiniz.';
            res.redirect('/giris');
        } else {
            res.render('user/dogrulama', { email: email, hata: 'Girdiğiniz kod hatalı!' });
        }
    } catch (error) {
        console.log(error);
        res.render('user/dogrulama', { email: req.body.email, hata: 'Beklenmeyen bir hata oluştu.' });
    }
});

router.get('/cikis', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

router.post('/giris', async (req, res) => {
    try {
        const { email, sifre } = req.body;
        const kullanici = await User.findOne({ where: { email: email } });

        if (!kullanici) {
            return res.render('user/kullanici-giris', { hata: 'E-posta adresiniz veya şifreniz hatalı!' });
        }

        const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre);
        if (!sifreDogruMu) {
            return res.render('user/kullanici-giris', { hata: 'E-posta adresiniz veya şifreniz hatalı!' });
        }

        if (kullanici.onaylandi_mi === false) {
            return res.redirect(`/dogrulama?email=${email}`);
        }

        req.session.user = kullanici;
        res.redirect('/');

    } catch (error) {
        console.log("Giriş işlemi sırasında hata:", error);
        res.render('user/kullanici-giris', { hata: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' });
    }
});

router.get("/giris", function (req, res) {
    res.render("user/kullanici-giris");
});

router.get("/kayit", function (req, res) {
    res.render("user/kullanici-kayit");
});

router.post('/kayit', async (req, res) => {
    try {
        const { ad, soyad, email, sifre } = req.body;

        const kullaniciVarMi = await User.findOne({ where: { email: email } });

        if (kullaniciVarMi) {
            return res.render('user/kullanici-kayit', { hata: 'Bu e-posta adresi sistemde zaten kayıtlı!' });
        }
        if (sifre.length < 6) {
            return res.render('user/kullanici-kayit', { hata: 'Şifre en az 6 karakter olmalıdır!' });
        }

        const hashliSifre = await bcrypt.hash(sifre, 10);

        const dogrulamaKodu = Math.floor(100000 + Math.random() * 900000).toString();

        await User.create({
            ad,
            soyad,
            email,
            sifre: hashliSifre,
            onay_kodu: dogrulamaKodu,
            onaylandi_mi: false
        });

        req.session.toastMesaj = 'Doğrulama kodunuz e-posta adresinize gönderildi. Lütfen hesabınızı doğrulayın.';

        const mailAyarlari = {
            from: "mehmetturanemin8@gmail.com",
            to: email,
            subject: "İşbul - Kayıt Doğrulama Kodu",
            text: `Sisteme kayıt olmak için doğrulama kodunuz: ${dogrulamaKodu}`
        };

        await transporter.sendMail(mailAyarlari);

        res.redirect(`/dogrulama?email=${email}`);

    } catch (error) {
        console.log(error);
        res.render('kayit', { hata: 'Beklenmeyen bir hata oluştu, lütfen tekrar deneyin.' });
    }
});

router.get('/ilan/:id', async (req, res) => {
    try {
        const ilanDetay = await ilanlar.findByPk(req.params.id, {
            include: [
                { model: User },
                { model: Kategori },
                {
                    model: IlanYorum,
                    as: "yorumlar",
                    include: [{ model: User, attributes: ['ad', 'soyad', 'rol'] }],
                }
            ],
            order: [
                [{ model: IlanYorum, as: 'yorumlar' }, 'yorum_tarihi', 'DESC']
            ]
        });

        if (!ilanDetay || ilanDetay.durum === 3 || ilanDetay.durum === 4 || ilanDetay.durum === 0 || ilanDetay.durum === 2) {
            req.session.toastMesaj = 'Böyle bir ilan bulunamadı.';
            return res.status(404).redirect("/");

        }

        if (ilanDetay.durum === 3) {
            req.session.toastMesaj = 'Böyle bir ilan bulunamadı.';
            return res.redirect('/');
        }

        res.render('user/ilan-detay', { ilan: ilanDetay });
    } catch (error) {
        console.error("Detay sayfası hatası:", error);
        res.send("Bir hata oluştu.");
    }
});

router.get("/ilanlarim", async function (req, res) {
    try {
        if (!req.session.user) {
            return res.redirect('/giris');
        }

        const ilanlarim = await ilanlar.findAll({
            where: { musteri_id: req.session.user.id, durum: { [Op.notIn]: [3, 4] } },
            order: [['id', 'DESC']]
        });

        res.render('user/ilanlarim', { ilanlarim: ilanlarim });

    } catch (error) {
        console.error("İlanlarım sayfası hatası:", error);
        res.send("Bir hata oluştu.");
    }
});

router.get("/ilanlar", async function (req, res) {
    try {
        const seciliKategoriAdi = req.query.kategori;
        const tumKategoriler = await Kategori.findAll();

        let ilanSartlari = { durum: 1 };

        let kategoriler = {
            model: Kategori,
            required: true
        };

        if (seciliKategoriAdi && seciliKategoriAdi !== "") {
            kategoriler.where = { kategori_adi: seciliKategoriAdi };
        }

        const sonIlanlar = await ilanlar.findAll({
            where: ilanSartlari,
            include: [kategoriler],
            order: [['id', 'DESC']]
        });

        res.render("user/ilanlar", {
            ilanlar: sonIlanlar,
            kategoriler: tumKategoriler,
            seciliKategori: seciliKategoriAdi || ""
        });

    } catch (err) {
        console.log("Filtreleme Hatası:", err);
        res.status(500).send("İlanlar yüklenirken bir sorun oluştu.");
    }
});

router.get("/", function (req, res) {
    res.render("user/index");
});

module.exports = router;