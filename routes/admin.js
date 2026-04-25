const express = require('express');
const router = express.Router();
const ilanlar = require("../models/İlanlar");
const User = require('../models/User');
const Kategori = require('../models/Kategori');

router.get('/admin/kategori-ekle', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.rol !== 'admin') {
            req.session.toastMesaj = 'Bu sayfaya erişim yetkiniz yok!';
            return res.redirect('/');
        }
        
        res.render('admin/kategori-ekle');

    } catch (error) {
        console.log("Kategori sayfası açılırken hata:", error);
        res.redirect('/');
    }
});

router.post('/admin/kategori-ekle', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.rol !== 'admin') {
            return res.redirect('/');
        }

        const { kategori_adi } = req.body;

        await Kategori.create({
            kategori_adi: kategori_adi
        });

        req.session.toastMesaj = 'Yeni kategori başarıyla eklendi!';
        res.redirect('/admin/kategori-ekle');

    } catch (error) {
        console.log("Kategori ekleme hatası:", error);
        req.session.toastMesaj = 'Kategori eklenirken bir hata oluştu.';
        res.redirect('/admin/kategori-ekle');
    }
});

router.get('/admin/ilan-onay', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.rol !== 'admin') {
            req.session.toastMesaj = 'Bu sayfayı görüntüleme yetkiniz yok!';
            return res.redirect('/');
        }
        const bekleyenIlanlar = await ilanlar.findAll({
            where: { durum: 0 },
            include: [{ model: User, as: 'user' }],
            order: [['id', 'DESC']]
        });

        res.render('admin/ilan-onay', { ilanlar: bekleyenIlanlar });

    } catch (error) {
        console.log("Admin ilan onay sayfası hatası:", error);
        res.redirect('/');
    }
});

router.post('/admin/ilan-onayla/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.rol !== 'admin') return res.redirect('/');

        const ilan = await ilanlar.findByPk(req.params.id);
        if (ilan) {
            ilan.durum = 1;
            await ilan.save();
            req.session.toastMesaj = 'İlan başarıyla onaylandı ve yayına alındı.';
        }
        res.redirect('/admin/ilan-onay');

    } catch (error) {
        console.log(error);
        res.redirect('/admin/ilan-onay');
    }
});

router.post('/admin/ilan-reddet/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.rol !== 'admin') return res.redirect('/');

        const ilan = await ilanlar.findByPk(req.params.id);
        if (ilan) {
            await ilan.destroy();
            req.session.toastMesaj = 'İlan reddedildi ve sistemden silindi.';
        }
        res.redirect('/admin/ilan-onay');

    } catch (error) {
        console.log(error);
        res.redirect('/admin/ilan-onay');
    }
});


module.exports = router;