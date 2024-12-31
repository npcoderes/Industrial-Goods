const sequelize = require('../config/sqldb');
const { DataTypes } = require('sequelize');
const Products = require('./products');
const Customer = require('./customer');
const Review = sequelize.define('Review', {
    ReviewID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Products,
            key: 'ProductID'
        }
    },
    CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customer,
            key: 'CustomerID'
        }
    },
    Rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    ReviewText: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },

}, {
    timestamps: true,

});
Review.belongsTo(Products, { foreignKey: 'ProductID' });
Review.belongsTo(Customer, { foreignKey: 'CustomerID' });
module.exports = Review;
