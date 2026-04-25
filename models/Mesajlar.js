const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Mesajlar = sequelize.define('mesajlar', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true, 
        allowNull: false 
    },
    gonderen_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    alici_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    ilan_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    mesaj: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    okundu_mu: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
    mesaj_tarihi: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    }
}, {
    timestamps: false, 
    freezeTableName: true
});

module.exports = Mesajlar;