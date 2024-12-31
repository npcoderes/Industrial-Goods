const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqldb'); // Import sequelize for the connection
const Products = require('./products'); // Import Products model for associations
const Customer = require('./customer'); // Import Customer model for associations

const PurchaseHistory = sequelize.define('PurchaseHistory', {
  HistoryID: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  CustomerID: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: Customer,
      key: 'CustomerID'
    }
  },
  ProductID: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: Products,
      key: 'ProductID'
    }
  },
  Quantity: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  TotalPrice: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  Status: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'Order Placed' // Initial status
  },
  RequestType: { 
    type: DataTypes.ENUM('Return', 'Replace',"Cancel"),
    allowNull: true, // Can be "Return", "Replace", or null
  },
  RequestReason: { 
    type: DataTypes.TEXT, 
    allowNull: true, // Reason for return/replace requests
  },
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, { 
  timestamps: true 
});


// Define associations
PurchaseHistory.belongsTo(Products, { foreignKey: 'ProductID' });
PurchaseHistory.belongsTo(Customer, { foreignKey: 'CustomerID' });


module.exports = PurchaseHistory;
