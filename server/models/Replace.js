const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqldb');
const Products = require('./products');
const PurchaseHistory = require('./purchaseHistory');

const Replace = sequelize.define('Replace', {
  ReplaceID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ProductID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Products,
      key: 'ProductID'
    }
  },
  PurchaseHistoryID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PurchaseHistory,
      key: 'HistoryID'
    }
  },
  Reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: true
});

// Define associations
Replace.belongsTo(Products, { foreignKey: 'ProductID' });
Replace.belongsTo(PurchaseHistory, { foreignKey: 'PurchaseHistoryID' });

module.exports = Replace;