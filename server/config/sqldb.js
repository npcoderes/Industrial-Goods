const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ds_enterprise', 'root', '', {
    host: 'localhost',
    dialect: 'mysql', 
});

module.exports = sequelize;
