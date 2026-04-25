require('dotenv').config();
const sequelize = require("./db");
const User = require("./models/User");
const Degerlendirmeler = require("./models/Degerlendirmeler");
const teklifler = require("./models/Teklifler");
const ilanlar = require("./models/İlanlar");
const Kategori = require("./models/Kategori");
const Mesajlar = require("./models/Mesajlar");
const IlanYorum = require("./models/Yorum");


ilanlar.hasMany(IlanYorum, { foreignKey: 'ilan_id' ,as: "yorumlar"});
IlanYorum.belongsTo(ilanlar, { foreignKey: 'ilan_id' });

User.hasMany(IlanYorum, { foreignKey: 'user_id' });
IlanYorum.belongsTo(User, { foreignKey: 'user_id' });

Kategori.hasMany(ilanlar, { foreignKey: 'kategori_id' });
ilanlar.belongsTo(Kategori, { foreignKey: 'kategori_id' });

User.hasMany(ilanlar, { foreignKey: 'musteri_id' });
ilanlar.belongsTo(User, { foreignKey: 'musteri_id' });

ilanlar.hasMany(teklifler, { foreignKey: 'ilan_id' });
teklifler.belongsTo(ilanlar, { foreignKey: 'ilan_id' });

User.hasMany(teklifler, { foreignKey: 'hizmetveren_id' });
teklifler.belongsTo(User, { foreignKey: 'hizmetveren_id' });

ilanlar.hasOne(Degerlendirmeler, { foreignKey: 'ilan_id' });
Degerlendirmeler.belongsTo(ilanlar, { foreignKey: 'ilan_id' });

User.hasMany(Degerlendirmeler, { foreignKey: 'hizmetveren_id' });
Degerlendirmeler.belongsTo(User, { foreignKey: 'hizmetveren_id' });

User.hasMany(ilanlar, { foreignKey: 'musteri_id' });
ilanlar.belongsTo(User, { foreignKey: 'musteri_id' });

User.hasMany(Degerlendirmeler, { foreignKey: 'musteri_id' });
Degerlendirmeler.belongsTo(User, { foreignKey: 'musteri_id' });

ilanlar.hasMany(Mesajlar, { foreignKey: 'ilan_id' });
Mesajlar.belongsTo(ilanlar, { foreignKey: 'ilan_id' });

User.hasMany(Mesajlar, { as: 'gonderilenMesajlar', foreignKey: 'gonderen_id' });
Mesajlar.belongsTo(User, { as: 'gonderen', foreignKey: 'gonderen_id' });

User.hasMany(Mesajlar, { as: 'alinanMesajlar', foreignKey: 'alici_id' });
Mesajlar.belongsTo(User, { as: 'alici', foreignKey: 'alici_id' });


async function sync() {
  try {
    await sequelize.sync(); 
    console.log('Veritabanı başarıyla senkronize edildi.');
  } catch (error) {
    console.log('Senkronizasyon hatası:', error);
  }
}
sync();


module.exports = {
  User,
  Degerlendirmeler,
  teklifler,
  ilanlar,
  Kategori,
  Mesajlar,
  IlanYorum
};