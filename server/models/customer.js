const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqldb');

const Customer = sequelize.define('Customer', {
  CustomerID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Name: { type: DataTypes.STRING, allowNull: false },
  Email: { type: DataTypes.STRING, allowNull: false, unique: true },
  Password: { type: DataTypes.STRING, allowNull: false },
   Address: { type: DataTypes.STRING, allowNull: false }, 
   Phone: { type: DataTypes.STRING, allowNull: false },
   Image: { type: DataTypes.STRING },

}, { timestamps: true });

module.exports = Customer;
