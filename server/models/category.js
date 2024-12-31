const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqldb');
const Admin = require('./admin');
const Categories = sequelize.define('Categories', {
  CategoryID: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  CategoryName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  Description: { 
    type: DataTypes.TEXT 
  },
  Active:{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
    AdminID: { 
        type: DataTypes.INTEGER,
        allowNull: false ,
        references: {
            model: 'admins', // Reference the Admins table
            key: 'AdminID'
        }
    }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});
// Define associations
Admin.hasMany(Categories, { foreignKey: 'AdminID' });
Categories.belongsTo(Admin, { foreignKey: 'AdminID' });

module.exports = Categories;
