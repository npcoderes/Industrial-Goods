const { DataTypes } = require('sequelize');
const sequelize = require('../config/sqldb');
const Categories = require('./category'); // Import Categories model for associations

const Admin = require('./admin'); // Import Admin model for associations
const Products = sequelize.define('Products', {
  ProductID: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  Name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  Description: { 
    type: DataTypes.TEXT("long")
  },
  Price: { 
    type: DataTypes.DECIMAL(10, 2), 
    allowNull: false 
  },
  Stock: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  Features : { 
    type: DataTypes.TEXT("long") 
  },
  CategoryID: { 
    type: DataTypes.INTEGER,
    allowNull: false, 
    references: {
      model: 'categories', // Reference the Categories table
      key: 'CategoryID'
    }
  },
    Image: { 
        type: DataTypes.STRING 
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
  timestamps: true 
});

// Define associations
Admin.hasMany(Products, { foreignKey: 'AdminID' });
Products.belongsTo(Admin, { foreignKey: 'AdminID' });

Categories.hasMany(Products, { foreignKey: 'CategoryID' });
Products.belongsTo(Categories, { foreignKey: 'CategoryID' });

module.exports = Products;
