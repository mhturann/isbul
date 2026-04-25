const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const Degerlendirmeler = sequelize.define('degerlendirmeler', {
    id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    puan:{ type: DataTypes.INTEGER, allowNull: false },
    yorum:{ type: DataTypes.TEXT, allowNull: false },
    musteri_id:{ type: DataTypes.INTEGER, allowNull: false },
    ilan_id:{ type: DataTypes.INTEGER, allowNull: false },
    hizmetveren_id:{ type: DataTypes.INTEGER, allowNull: false }
},{timestamps: false, freezeTableName: true});


module.exports = Degerlendirmeler;