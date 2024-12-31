const sequelize = require('../config/sqldb'); // Import sequelize for the connection
const { DataTypes } = require('sequelize');
const Products = require('./products'); // Import Products model for associations

const Invoice = sequelize.define('Invoice', {
    InvoiceID: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    CustomerID: { 
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
            model: 'customers', // Reference the Customers table
            key: 'CustomerID'
        }
    },
    InvoiceDate: { 
        type: DataTypes.DATE, 
        allowNull: false,
        defaultValue: Date.now
    },
    TotalPrice: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    PaymentMethod: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    ProductId:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Products, // Reference the Products table
            key: 'ProductID'
        }
    },
    Quantity: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },

    }, { 
    timestamps: true 
    });

module.exports = Invoice;