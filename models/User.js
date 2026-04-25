const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
    id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    ad:{ type: DataTypes.STRING, allowNull: false },
    profil_fotografi:{ type: DataTypes.STRING, allowNull: true },
    soyad:{ type: DataTypes.STRING, allowNull: false },
    email:{ type: DataTypes.STRING, allowNull: false, unique: true },
    sifre:{ type: DataTypes.STRING, allowNull: false },
    rol:{ type: DataTypes.STRING, allowNull: false, defaultValue: 'musteri' },
    kayitTarihi:{ type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    onay_kodu:{ type: DataTypes.STRING, allowNull: true },
    onaylandimi:{ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
},{freezeTableName: true, timestamps: false});


module.exports = User;