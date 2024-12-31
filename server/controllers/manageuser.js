const Customer = require('../models/customer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const mailSender = require('../utils/mailSender');


exports.createCustomer = async (req, res) => {
  try {
    const { Name, Email, Address, Phone } = req.body;
    const hashedPassword = await bcrypt.hash(Name, 10);
    const customer = await Customer.create({ Name, Email, Password: hashedPassword, Address, Phone });
    await mailSender(
      Email,
      "Welcome to Industrial Goods",
      `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                <!-- Header -->
                <div style="background-color: #1a73e8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0;">Welcome to Industrial Goods</h1>
                </div>
    
                <!-- Content -->
                <div style="padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                        Dear ${Name},
                    </p>
                    
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                        Your account has been successfully created. Below are your account details:
                    </p>
    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${Email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${Phone}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${Name} :- You can change your password after login.</p>
                    </div>
    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/login" 
                           style="background-color: #1a73e8; color: #ffffff; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Login to Your Account
                        </a>
                    </div>
    
                    <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                        If you have any questions or need assistance, please don't hesitate to contact our support team.
                    </p>
                </div>
    
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px;">
                    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
                        © ${new Date().getFullYear()} Industrial Goods. All rights reserved.
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
                        This is an automated message, please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    );
    res.status(201).json({ success: true, customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ success: false, message: 'Error creating customer.' });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Error fetching customers.' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Address, Phone } = req.body;
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    await customer.update({ Name, Email, Address, Phone });
    res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Error updating customer.' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    await customer.destroy();
    res.status(200).json({ success: true, message: 'Customer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Error deleting customer.' });
  }
};




exports.createAdmin = async (req, res) => {
  try {
    const { Name, Email, Password, Phone, Image } = req.body;
    const hashedPassword = await bcrypt.hash(Password, 10);
    const admin = await Admin.create({ Name, Email, Password: hashedPassword, Phone, Image });
    await mailSender(
      Email,
      "Welcome to Industrial Goods",
      `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
                <!-- Header -->
                <div style="background-color: #1a73e8; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0;">Welcome to Industrial Goods</h1>
                </div>
    
                <!-- Content -->
                <div style="padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                        Dear ${Name},
                    </p>
                    
                    <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                        Your account has been successfully created. Below are your account details:
                    </p>
    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${Email}</p>
                        <p style="margin: 5px 0;"><strong>Phone:</strong> ${Phone}</p>
                        <p style="margin: 5px 0;"><strong>Password:</strong> ${Name} :- You can change your password after login.</p>
                    </div>
    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/login" 
                           style="background-color: #1a73e8; color: #ffffff; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Login to Your Account
                        </a>
                    </div>
    
                    <p style="font-size: 14px; color: #666666; margin-top: 30px;">
                        If you have any questions or need assistance, please don't hesitate to contact our support team.
                    </p>
                </div>
    
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px;">
                    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
                        © ${new Date().getFullYear()} Industrial Goods. All rights reserved.
                    </p>
                    <p style="font-size: 12px; color: #999999; margin: 5px 0;">
                        This is an automated message, please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `
    );
    res.status(201).json({ success: true, admin });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, message: 'Error creating admin.' });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Error fetching admins.' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Phone, Image } = req.body;
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    await admin.update({ Name, Email, Phone, Image });
    res.status(200).json({ success: true, admin });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ success: false, message: 'Error updating admin.' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    await admin.destroy();
    res.status(200).json({ success: true, message: 'Admin deleted successfully.' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ success: false, message: 'Error deleting admin.' });
  }
};