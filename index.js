const express = require("express");
const session = require("express-session");
require('dotenv').config();
const sequelize = require("./db");
const { User, Degerlendirmeler, teklifler, ilanlar, Kategori, Calismalar , IlanYorum} = require("./relations");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.toastMesaj = req.session.toastMesaj || null;
    delete req.session.toastMesaj;
    next();
});

const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use(adminRoutes);
app.use(userRoutes);

app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor...`);
});