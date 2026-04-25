const sequelize = require('./db');
const User = require('./models/User'); 
const Kategori = require('./models/Kategori'); 
const Ilanlar = require('./models/İlanlar'); 

async function dummyVerileriEkle() {
    try {
        console.log("Veritabanı dolduruluyor, lütfen bekleyin...");

        const katElektrik = await Kategori.create({ kategori_adi: 'Elektrik & Tesisat' });
        const katYazilim = await Kategori.create({ kategori_adi: 'Web Geliştirme' });

        const musteri1 = await User.create({
            ad: 'Ahmet',
            soyad: 'Yılmaz',
            email: 'ahmet@test.com',
            sifre: '123456',
            rol: 'musteri' ,
            onay_kodu: '123456',
        });

        const musteri2 = await User.create({
            ad: 'Ayşe',
            soyad: 'Kaya',
            email: 'ayse@test.com',
            sifre: '123456',
            rol: 'musteri',
            onay_kodu: '123456',
        });

        const admin = await User.create({
            ad: 'Mehmet',
            soyad: 'Turan',
            email: 'mehmetturanemin8@gmail.com',
            sifre: '123456',
            rol: 'admin',
            onay_kodu: '123456',
            onaylandimi:1
        });

        await Ilanlar.create({
            baslik: 'Dükkan Elektrik Panosu Yenileme',
            aciklama: 'Dükkanın eskiyen elektrik panosu ve şalterleri tamamen yenilenecek. Priz hatları baştan çekilecek. İşi temiz yapacak usta bir elektrik teknisyeni aranıyor.',
            musteri_id: musteri1.id,
            kategori_id: katElektrik.id,
            durum: 1,
            
        });
        await Ilanlar.create({
            baslik: 'Dükkan Elektrik Panosu Yenileme',
            aciklama: 'Dükkanın eskiyen elektrik panosu ve şalterleri tamamen yenilenecek. Priz hatları baştan çekilecek. İşi temiz yapacak usta bir elektrik teknisyeni aranıyor.',
            musteri_id: musteri1.id,
            kategori_id: katElektrik.id,
            durum: 1,
           
        });
        await Ilanlar.create({
            baslik: 'Dükkan Elektrik Panosu Yenileme',
            aciklama: 'Dükkanın eskiyen elektrik panosu ve şalterleri tamamen yenilenecek. Priz hatları baştan çekilecek. İşi temiz yapacak usta bir elektrik teknisyeni aranıyor.',
            musteri_id: musteri1.id,
            kategori_id: katElektrik.id,
            durum: 1,
            
        });

        await Ilanlar.create({
            baslik: 'Java ve C# Backend Entegrasyonu',
            aciklama: 'Mevcut projemizin backend tarafında Java ve C# ile yazılmış farklı servislerin birbiriyle haberleşmesini sağlayacak bir yazılımcı arıyorum.',
            musteri_id: musteri1.id, 
            kategori_id: katYazilim.id,    
            durum: 1,
            
        });

        console.log("Veritabanı dolduruldu.");
        process.exit(); 

    } catch (error) {
        console.error("Veri eklenirken bir hata oluştu:", error);
        process.exit();
    }
}

dummyVerileriEkle();