const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

async function connect(){
    try {
        await sequelize.authenticate();
        console.log('Veritabanına bağlantı başarılı.');
    } catch (err) {
        console.error('Veritabanına bağlantı başarısız:', err);
    }
}

connect();  
module.exports = sequelize;
