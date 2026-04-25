const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const Teklifler = sequelize.define('teklifler', {
    id:{ type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    teklif_fiyati:{ type: DataTypes.INTEGER, allowNull: false },
    mesaj:{ type: DataTypes.TEXT, allowNull: false },
    durum:{ type: DataTypes.STRING,allowNull: false  },
    ilan_id:{ type: DataTypes.INTEGER, allowNull: false },
    hizmetveren_id:{ type: DataTypes.INTEGER, allowNull: false }
},{timestamps: false , freezeTableName: true});



module.exports = Teklifler;