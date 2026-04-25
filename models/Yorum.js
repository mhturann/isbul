const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const IlanYorum = sequelize.define("ilan_yorumlar", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    yorum_metni: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ilan_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    yorum_tarihi:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {timestamps:false, freezeTableName:true});

module.exports = IlanYorum;