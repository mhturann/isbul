const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const İlanlar = sequelize.define('ilanlar', {
    id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    baslik:{ type: DataTypes.STRING, allowNull: false },
    aciklama:{ type: DataTypes.TEXT, allowNull: false },
    musteri_id:{ type: DataTypes.INTEGER, allowNull: false },
    kategori_id:{ type: DataTypes.INTEGER, allowNull: false },
    durum:{ type: DataTypes.TINYINT, allowNull: false },
    ilan_tarihi:{ type: DataTypes.DATE, allowNull: false,defaultValue: DataTypes.NOW }
},{timestamps: false , freezeTableName: true});



module.exports = İlanlar;