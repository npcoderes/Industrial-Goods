// Import the Admin model for interacting with the admin table in the database
const Admin = require('../models/admin'); 

// Import the Category model for interacting with the category table
const Category = require('../models/category'); 

// Import the Categories model for managing associations related to categories
const Categories = require('../models/category'); 

// Import bcryptjs for hashing and comparing passwords
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt for hashing passwords

// Import the Products model for interacting with the products table
const Products = require('../models/products'); 

// Import the PurchaseHistory model to track purchase history of customers
const PurchaseHistory = require('../models/purchaseHistory'); 

// Import utility functions for handling image uploads and deletions in Cloudinary
const { uploadImageToCloudinary, deleteResourceFromCloudinary } = require('../utils/imageUploader');

// Import the Customer model for interacting with the customers table
const Customer = require('../models/customer'); 

// Import the Sequelize instance to interact with the SQL database
const sequelize = require('../config/sqldb'); 

// Import the Invoice model for managing invoices in the application
const Invoice = require('../models/Invoice'); 

// Import Sequelize's operators for advanced query capabilities (e.g., comparison, range)
const { Op } = require('sequelize'); 

// Import dotenv to load environment variables from the .env file
dotenv = require('dotenv'); 

// Import the Return model for managing product returns
const Return = require('../models/Return'); 

// Import the Replace model for managing product replacements
const Replace = require('../models/Replace'); 

// Import the sendMail function for sending emails
const sendMail = require('../config/mailSender');

// Import the mailSender configuration to manage email notifications
const mailSender = require('../config/mailSender'); 

// Configure dotenv to load environment variables from the .env file
dotenv.config();
// Login Function


// Admin signup handler
exports.signupAdmin = async (req, res) => {
  try {
    const { Name, Email, Password, Phone } = req.body; // Extract required fields from the request body
    let Image = req.files.Image; // Extract the uploaded image file

    // Check if Email is already registered
    const existingCustomer = await Admin.findOne({ where: { Email } });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email is already registered!' });
    }

    // Upload image to Cloudinary if provided
    if (Image) {
      const result = await uploadImageToCloudinary(Image, process.env.FOLDER_NAME);
      Image = result.secure_url; // Update Image with the secure URL from Cloudinary
    }

    // Hash the password
    const salt = 10; // Define salt rounds for hashing
    const hashedPassword = bcrypt.hash(Password, salt); // Hash the password

    // Create a new admin record in the database
    const newAdmin = await Admin.create({
      Name,
      Email,
      Password: (await hashedPassword).toString(), // Store hashed password
      Phone,
      Image,
    });

    // Respond with success message and admin details
    res.status(201).json({
      success: true,
      message: 'Signup successful!',
      admin: {
        AdminID: newAdmin.AdminID,
        Name: newAdmin.Name,
        Email: newAdmin.Email,
      },
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Create category handler
exports.createCategory = async (req, res) => {
  try {
    const { CategoryName, Description } = req.body; // Extract category details from the request body
    const AdminID = await req.user.id; // Get the ID of the admin creating the category
    console.log("sss", AdminID);

    // Check if the category already exists
    const existingCategory = await Category.findOne({ where: { CategoryName } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists!' });
    }

    // Create a new category record in the database
    const newCategory = await Category.create({
      CategoryName,
      Description,
      AdminID,
    });

    // Respond with success message and category details
    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category: {
        CategoryID: newCategory.CategoryID,
        Name: newCategory.Name,
        Description: newCategory.Description,
        Image: newCategory.Image,
      },
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Update category handler
exports.updateCategory = async (req, res) => {
  try {
    const { CategoryName, Description, CategoryID, Active } = req.body; // Extract category details from the request body
    const AdminID = await req.user.id; // Get the ID of the admin updating the category

    // Find the category to be updated
    const category = await Category.findOne({ where: { CategoryID } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found!' });
    }

    // Check if the admin is the owner of the category
    if (category.AdminID !== AdminID) {
      return res.status(403).json({ error: 'You are not authorized to update this category!' });
    }

    // Update the category record in the database
    await Category.update({ CategoryName, Description, Active }, { where: { CategoryID } });

    // Respond with success message
    res.status(200).json({ success: true, category: Category, message: 'Category updated successfully!' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Get all categories handler
exports.getAllCategories = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.findAll();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found." });
    }

    // Respond with success message and category list
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    // Fetch all products with their associated category and admin details
    const products = await Products.findAll({
      include: [
        { model: Categories, as: 'Category', attributes: ['CategoryName'] },
        { model: Admin, as: 'Admin', attributes: ['Name'] },
      ],
    });
    // Respond with the list of products
    res.status(200).json({ success: true, products });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Add a new product
exports.createProduct = async (req, res) => {
  try {
    const { Name, Description, Price, Stock, CategoryID, Features } = req.body; // Extract product details from the request body
    let Image = req.files.Image; // Extract the uploaded image file

    const AdminID = req.user.id; // Extract admin ID from the authentication middleware

    // Upload image to Cloudinary if provided
    if (Image) {
      const result = await uploadImageToCloudinary(Image, process.env.FOLDER_NAME);
      Image = result.secure_url; // Update Image with the secure URL from Cloudinary
    }

    // Create a new product record in the database
    const product = await Products.create({
      Name,
      Description,
      Price,
      Stock,
      CategoryID,
      Image,
      AdminID,
      Features,
    });

    // Respond with success message and product details
    res.status(201).json({ success: true, product, message: 'Product created successfully!' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { ProductID, Name, Description, Price, Stock, CategoryID, Features } = req.body; // Extract product details from the request body

    // Find the product to be updated
    const product = await Products.findOne({ where: { ProductID } });
    if (!product) return res.status(404).json({ error: 'Product not found!' }); // Check if the product exists

    // Update the product record in the database
    await Products.update(
      { Name, Description, Price, Stock, CategoryID, Features },
      { where: { ProductID } }
    );

    // Respond with success message
    res.status(200).json({ success: true, message: 'Product updated successfully!' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { ProductID } = req.params; // Extract product ID from request parameters

    // Find the product to be deleted
    const product = await Products.findOne({ where: { ProductID } });
    if (!product) return res.status(404).json({ error: 'Product not found!' }); // Check if the product exists

    // Delete the product image from Cloudinary
    await deleteResourceFromCloudinary(product.Image);

    // Delete the product record from the database
    await Products.destroy({ where: { ProductID } });

    // Respond with success message
    res.status(200).json({ success: true, message: 'Product deleted successfully!' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  const ProductID = req.params.ProductID; // Extract product ID from request parameters
  console.log("product id", ProductID); // Log the product ID for debugging

  // Fetch the product by its ID along with its associated category details
  const product = await Products.findByPk(ProductID, {
    include: [{ model: Categories, as: 'Category' }],
  });

  // Check if the product exists
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Respond with the product details
  res.json({ product });
};



exports.updateOrderStatus = async (req, res) => {
  const { historyId, status } = req.body;
  const HistoryID = historyId;

  // Validate status
  const validStatuses = ['Order Placed', 'Out for Delivery', 'Delivered', 'Canceled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status.'
    });
  }

  const t = await sequelize.transaction();

  try {
    const order = await PurchaseHistory.findOne({
      where: { HistoryID },
      include: ['Customer', 'Product'],
      lock: true,
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Validate status transition
    const validTransitions = {
      'Order Placed': ['Out for Delivery', 'Canceled'],
      'Out for Delivery': ['Delivered', 'Canceled'],
      'Delivered': [],
      'Canceled': []
    };

    if (!validTransitions[order.Status]?.includes(status)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.Status} to ${status}`
      });
    }

    // Handle inventory for cancellation
    if (status === 'Canceled') {
      await Products.increment({
        Stock: order.Quantity
      }, {
        where: { ProductID: order.ProductID },
        transaction: t
      });
    }

    // Update order status
    await order.update({
      Status: status,
      UpdatedAt: new Date()
    }, { transaction: t });

// Send email notification
const emailContent = {
  Order_Placed: 'Your order has been placed successfully and is being processed.',
  'Out for Delivery': 'Your order is out for delivery and will arrive shortly.',
  Delivered: 'Your order has been delivered successfully.',
  Canceled: 'Your order has been canceled as per request.'
};

await mailSender(
   order.Customer.Email,
   `Order Status Update - ${status}`,
  `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background: #fff; padding: 20px; border: 1px solid #ddd; }
              .order-details { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #1a73e8; }
              .status { font-size: 18px; color: #1a73e8; margin: 15px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
              a{ color: white; text-decoration: none; }
              .button { background: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Order Status Update</h1>
              </div>
              <div class="content">
                  <p>Dear ${order.Customer.Name},</p>
                  <div class="status">
                      Status: ${status}
                  </div>
                  <p>${emailContent[status]}</p>
                  
                  <div class="order-details">
                      <h2>Order Details</h2>
                      <table>
                          <tr>
                              <th>Order ID:</th>
                              <td>#${order.HistoryID}</td>
                          </tr>
                          <tr>
                              <th>Product:</th>
                              <td>${order.Product.Name}</td>
                          </tr>
                          <tr>
                              <th>Quantity:</th>
                              <td>${order.Quantity}</td>
                          </tr>
                          <tr>
                              <th>Total Price:</th>
                              <td>₹${order.TotalPrice}</td>
                          </tr>
                      </table>
                  </div>

                  <a href="${process.env.FRONTEND_URL}/orders/${order.HistoryID}" class="button">
                      View Order Details
                  </a>

                  <p>If you have any questions about your order, please don't hesitate to contact us.</p>
              </div>
              <div class="footer">
                  <p>This is an automated message, please do not reply to this email.</p>
                  <p>For support, contact us at support@industrialgoods.com</p>
                  <p>&copy; ${new Date().getFullYear()} Industrial Goods. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
  `
);
    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`
    });

  } catch (error) {
    await t.rollback();
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status.'
    });
  }
};


exports.handleReturnOrReplaceRequest = async (req, res) => {
  const { historyId, action } = req.body;

  if (!['Approve', 'Reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid action.'
    });
  }

  const t = await sequelize.transaction();

  try {
    const order = await PurchaseHistory.findOne({
      where: { HistoryID: historyId },
      include: [
        { model: Products },
        { model: Customer }
      ],
      lock: true,
      transaction: t
    });

    if (!order || !order.RequestType) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'No request found for this order.'
      });
    }

    if (action === 'Approve') {
      if (order.RequestType === 'Return') {
        // Handle return - increment stock
        await Products.increment({
          Stock: order.Quantity
        }, {
          where: { ProductID: order.ProductID },
          transaction: t
        });

        // Create return record
        await Return.create({
          ProductID: order.ProductID,
          PurchaseHistoryID: order.HistoryID,
          Reason: order.RequestReason,
          Count: order.Quantity
        }, { transaction: t });

      } else if (order.RequestType === 'Replace') {
        // For replacement, stock remains same as it's just an exchange

        // You might want to create a new order for replacement
        await PurchaseHistory.create({
          CustomerID: order.CustomerID,
          ProductID: order.ProductID,
          Quantity: order.Quantity,
          TotalPrice: order.TotalPrice,
          Status: 'Order Placed',
          IsReplacement: true,
          OriginalOrderID: order.HistoryID
        }, { transaction: t });

        // Create replace record
        await Replace.create({
          ProductID: order.ProductID,
          PurchaseHistoryID: order.HistoryID,
          Reason: order.RequestReason,
          Count: order.Quantity
        }, { transaction: t });
      }
    }
    let req=order.RequestType;


    // Update order status
    await order.update({
      Status: `${order.RequestType} ${action}ed`,
      RequestType: null,
      RequestReason: null,
      ProcessedAt: new Date()
    }, { transaction: t });

   
    // Send email notification
    await mailSender(
      order.Customer.Email,
     `${req} Request ${action}ed - Industrial Goods`,
       `
          <!DOCTYPE html>
          <html>
          <head>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                  .content { background: #fff; padding: 20px; border: 1px solid #ddd; }
                  .request-details { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #1a73e8; }
                  .status { 
                      font-size: 18px; 
                      color: ${action === 'Approve' ? '#4CAF50' : '#f44336'}; 
                      margin: 15px 0; 
                      padding: 10px;
                      border-radius: 4px;
                      background: ${action === 'Approve' ? '#E8F5E9' : '#FFEBEE'};
                  }
                  .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                  th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
                  .button { 
                      background: #1a73e8; 
                      color: white; 
                      padding: 12px 25px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block; 
                      margin: 20px 0; 
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1>${req} Request Update</h1>
                  </div>
                  <div class="content">
                      <p>Dear ${order.Customer.Name},</p>
                      
                      <div class="status">
                          Your ${req} request has been ${action}ed
                      </div>
  
                      <div class="request-details">
                          <h2>Request Details</h2>
                          <table>
                              <tr>
                                  <th>Order ID:</th>
                                  <td>#${order.HistoryID}</td>
                              </tr>
                              <tr>
                                  <th>Product:</th>
                                  <td>${order.Product.Name}</td>
                              </tr>
                              <tr>
                                  <th>Quantity:</th>
                                  <td>${order.Quantity}</td>
                              </tr>
                              <tr>
                                  <th>Request Type:</th>
                                  <td>${req}</td>
                              </tr>
                              <tr>
                                  <th>Request Reason:</th>
                                  <td>${order.RequestReason}</td>
                              </tr>
                          </table>
                      </div>
  
                      ${req === 'Replace' && action === 'Approve' ? `
                          <div style="background: #E8F5E9; padding: 15px; border-radius: 4px; margin: 15px 0;">
                              <h3 style="color: #4CAF50; margin: 0;">Replacement Order Created</h3>
                              <p>A new replacement order has been created and will be processed shortly.</p>
                          </div>
                      ` : ''}

                      ${req === 'Return' && action === 'Approve' ? `
                          <div style="background: #E8F5E9; padding: 15px; border-radius: 4px; margin: 15px 0;">
                          <h3 style="color: #4CAF50; margin: 0;">Return Order
                          Created</h3>
                          <p>A new return order has been created and will be processed shortly.</p>
                          </div>
                          ` : ''}

                        
  
                      <a href="${process.env.FRONTEND_URL}/orders/${order.HistoryID}" class="button">
                          View Order Details
                      </a>
  
                      ${action === 'Reject' ? `
                          <p style="color: #666;">
                              If you have any questions about why your request was rejected, 
                              please contact our customer support.
                          </p>
                      ` : ''}
                  </div>
                  <div class="footer">
                      <p>This is an automated message, please do not reply to this email.</p>
                      <p>For support, contact us at support@industrialgoods.com</p>
                      <p>&copy; ${new Date().getFullYear()} Industrial Goods. All rights reserved.</p>
                  </div>
              </div>
          </body>
          </html>
      `
  );
  await t.commit();
    return res.status(200).json({
      success: true,
      message: `${req} request ${action.toLowerCase()}ed successfully.`
    });

  } catch (error) {
    await t.rollback();
    console.error('Error handling request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to handle request.'
    });
  }
};

exports.fetchOrders = async (req, res) => {
  try {
    const orders = await PurchaseHistory.findAll({
      include: [
        {
          model: Products,
          attributes: ['Name', 'Price'],
        },
        {
          model: Customer,
          attributes: ['Name', 'Email'],
        },
      ],
      order: [['createdAt', 'DESC']], // Latest orders first
    });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders.' });
  }
};



exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    console.log('Report request:', { startDate, endDate, reportType }); // Debug log

    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    switch (reportType) {
      case 'orders':
        const orderStats = await PurchaseHistory.findAll({
          where: whereClause,
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('HistoryID')), 'totalOrders'],
            [sequelize.fn('SUM', sequelize.col('TotalPrice')), 'totalRevenue'],
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date']
          ],
          group: [sequelize.fn('DATE', sequelize.col('createdAt'))]
        });
        return res.json({ success: true, data: orderStats });

      case 'returns':
        const returnStats = await Return.findAll({
          where: whereClause,
          include: [
            {
              model: Products,
              attributes: ['Name']
            }
          ],
          attributes: [
            'ProductID',
            'Reason',
            [sequelize.fn('COUNT', sequelize.col('ReturnID')), 'count']
          ],
          group: ['ProductID', 'Product.Name', 'Reason']
        });
        return res.json({ success: true, data: returnStats });

      case 'revenue':
        const revenueStats = await Invoice.findAll({
          where: whereClause,
          attributes: [
            [sequelize.fn('DATE', sequelize.col('InvoiceDate')), 'date'],
            [sequelize.fn('SUM', sequelize.col('TotalPrice')), 'revenue']
          ],
          group: [sequelize.fn('DATE', sequelize.col('InvoiceDate'))]
        });
        return res.json({ success: true, data: revenueStats });

      case 'products':
        const productStats = await PurchaseHistory.findAll({
          where: whereClause,
          include: [
            {
              model: Products,
              attributes: ['Name']
            }
          ],
          attributes: [
            'ProductID',
            [sequelize.fn('COUNT', sequelize.col('HistoryID')), 'totalSold'],
            [sequelize.fn('SUM', sequelize.col('TotalPrice')), 'totalRevenue']
          ],
          group: ['ProductID', 'Product.Name']
        });

        // Fetch return details for products
        const productReturnStats = await Return.findAll({
          where: whereClause,
          include: [
            {
              model: Products,
              attributes: ['Name']
            }
          ],
          attributes: [
            'ProductID',
            'Reason',
            [sequelize.fn('COUNT', sequelize.col('ReturnID')), 'count']
          ],
          group: ['ProductID', 'Product.Name', 'Reason']
        });

        // Fetch replace details for products
        const productReplaceStats = await Replace.findAll({
          where: whereClause,
          include: [
            {
              model: Products,
              attributes: ['Name']
            }
          ],
          attributes: [
            'ProductID',
            'Reason',
            [sequelize.fn('COUNT', sequelize.col('ReplaceID')), 'count']
          ],
          group: ['ProductID', 'Product.Name', 'Reason']
        });

        // Merge product stats with return and replace details
        const mergedProductStats = productStats.map(product => {
          const returns = productReturnStats.filter(ret => ret.ProductID === product.ProductID);
          const replaces = productReplaceStats.filter(rep => rep.ProductID === product.ProductID);
          return {
            ...product.dataValues,
            returns: returns.map(ret => ({
              reason: ret.Reason,
              count: ret.count
            })),
            replaces: replaces.map(rep => ({
              reason: rep.Reason,
              count: rep.count
            }))
          };
        });

        return res.json({ success: true, data: mergedProductStats });

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

  } catch (error) {
    console.error('Report generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating report'
    });
  }
};

