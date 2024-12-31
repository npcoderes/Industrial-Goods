const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqldb');

const Admin = sequelize.define('Admin', {
  AdminID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  Name: { type: DataTypes.STRING, allowNull: false },
  Email: { type: DataTypes.STRING, allowNull: false, unique: true },
  Password: { type: DataTypes.STRING, allowNull: false },
  Address : { type: DataTypes.TEXT, allowNull: false },
  Phone: { type: DataTypes.STRING, allowNull: false },
  Image: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

module.exports = Admin;
