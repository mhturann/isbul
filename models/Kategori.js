const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const Kategori = sequelize.define('kategori', {
    id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    kategori_adi:{ type: DataTypes.STRING, allowNull: false }
},{timestamps: false , freezeTableName: true});



module.exports = Kategori;