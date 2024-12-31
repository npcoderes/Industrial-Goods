const sequelize = require('../database/sqldb');
const Admin = require('./admin');
const Customer = require('./customer');
const Categories = require('./category');
const Products = require('./product');
const PurchaseHistory = require('./purchaseHistory');
const Invoice = require('./Invoice');
// Define Relationships
Admin.hasMany(Categories, { foreignKey: 'AdminID' });
Categories.belongsTo(Admin);

Admin.hasMany(Products, { foreignKey: 'AdminID' });
Products.belongsTo(Admin);

Categories.hasMany(Products, { foreignKey: 'CategoryID' });
Products.belongsTo(Categories);

Customer.hasMany(PurchaseHistory, { foreignKey: 'CustomerID' });
PurchaseHistory.belongsTo(Customer);

Products.hasMany(PurchaseHistory, { foreignKey: 'ProductID' });
PurchaseHistory.belongsTo(Products);

Customer.hasMany(Invoice, { foreignKey: 'CustomerID' });
Invoice.belongsTo(Customer);

Products.hasMany(Invoice, { foreignKey: 'ProductID' });
Invoice.belongsTo(Products);

// Export models
module.exports = { sequelize, Admin, Customer, Categories, Products, PurchaseHistory };
