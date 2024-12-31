const Admin= require('../models/admin'); // Import Admin model
const Customer = require('../models/customer'); // Import Customer model
const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt
const jwt = require('jsonwebtoken'); // Optional for token generation
const {uploadImageToCloudinary, deleteResourceFromCloudinary} = require('../utils/imageUploader');
dotenv = require('dotenv');
const mailSender = require('../utils/mailSender');
const OTP = require('../models/OTP'); 
const { Op } = require('sequelize');

dotenv.config();
// Login Function
exports.login = async (req, res) => {
    try {
      const { Email, Password } = req.body;
  
      // Check in Admin table
      const admin = await Admin.findOne({ where: { Email } });
     
      if (admin) {
        const isPasswordValid = await bcrypt.compare(Password, admin.Password);
        if (isPasswordValid) {
          // Generate a token (optional)
          const token = jwt.sign({ id: admin.AdminID, role: 'Admin' }, process.env.JWT_SECRET);
          admin.Password = undefined;
          return res.status(200).json({success:true, message: 'Login successful!', role: 'Admin', token, user:admin });
        } else {
          return res.status(401).json({ error: 'Invalid password!' });
        }
      }
  
      // Check in Customer table
      const customer = await Customer.findOne({ where: { Email } });
      if (customer) {
        const isPasswordValid = await bcrypt.compare(Password, customer.Password);
        if (isPasswordValid) {
          // Generate a token (optional)
          customer.Password = undefined;
          const token = jwt.sign({ id: customer.CustomerID, role: 'Customer' }, process.env.JWT_SECRET);
          return res.status(200).json({ success:true, message: 'Login successful!', role: 'Customer', token,user:customer });
        } else {
          return res.status(401).json({ error: 'Invalid password!' });
        }
      }
  
      // If email not found in either table
      return res.status(404).json({ error: 'User not found!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Add OTP storage (temporary - should use Redis in production)
const otpStore = new Map();

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  exports.initiateSignup = async (req, res) => {
    try {
      const { Email,Name,Phone,Address,Password } = req.body;
      console.log("Email....",Email);
      const Image = req.files?.Image;
  
      // Check existing user
      const existingUser = await Customer.findOne({ where: { Email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
        
      // Generate OTP
      const otp = generateOTP();
  
      // Store signup data and OTP
      otpStore.set(Email, {
        otp,
        timestamp: Date.now(),
        signupData: { Name, Email, Password, Address, Phone, Image }
      });
  
      // Send OTP email
      await mailSender(
        Email,
        'Account Verify OTP - Industrial Goods',
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                .otp-box { 
                    background: #f5f5f5; 
                    padding: 20px; 
                    margin: 20px 0; 
                    border-left: 4px solid #1a73e8; 
                    font-size: 24px; 
                    text-align: center; 
                    letter-spacing: 3px;
                }
                .timer { color: #d93025; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .security-tips { background: #fafafa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Account Creation Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your Industrial Goods account password. Your One-Time Password (OTP) is:</p>
                    
                    <div class="otp-box">
                        <strong>${otp}</strong>
                    </div>
    
                    <p class="timer">⏰ This OTP will expire in 5 minutes</p>
    
                    <div class="security-tips">
                        <p><strong>Security Tips:</strong></p>
                        <ul>
                            <li>Never share your OTP with anyone</li>
                            <li>Our team will never ask for your OTP</li>
                            <li>Ensure you're on our official website</li>
                        </ul>
                    </div>
    
                    <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
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
      console.log("mail send success fully :-",otp);
  
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  exports.verifySignupOTP = async (req, res) => {
    try {
      const { Email, otp } = req.body;
    
      const storedData = otpStore.get(Email);

     

  
      // Validate OTP
      if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP'
        });
      }
  
      // Check OTP expiry (5 minutes)
      if (Date.now() - storedData.timestamp > 5 * 60 * 1000) {
        otpStore.delete(Email);
        return res.status(400).json({
          success: false,
          message: 'OTP expired'
        });
      }
  
      // Upload image if exists
      let imageUrl;
      if (storedData.signupData.Image) {
        const result = await uploadImageToCloudinary(
          storedData.signupData.Image,
          process.env.FOLDER_NAME
        );
        imageUrl = result.secure_url;
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(storedData.signupData.Password, 10);
     
  
      // Create new user
      const newCustomer = await Customer.create({
        ...storedData.signupData,
        Password: hashedPassword,
        Image: imageUrl
      });
     
  
      // Clear OTP data
      otpStore.delete(Email);
      await mailSender(
        Email,
        'Welcome to Industrial Goods',
        `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
              .button { background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Industrial Goods!</h1>
              </div>
              <div class="content">
                <h2>Account Created Successfully</h2>
                <p>Dear ${storedData.signupData.Name},</p>
                <p>Thank you for creating an account with Industrial Goods. We're excited to have you as part of our community!</p>
                <p>Your account has been successfully created and is now ready to use.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
                </div>
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                <p>Best regards,<br>The Industrial Goods Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
                <p>© ${new Date().getFullYear()} Industrial Goods. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
        `
      );

   
  
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        customer: {
          CustomerID: newCustomer.CustomerID,
          Name: newCustomer.Name,
          Email: newCustomer.Email
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  
  // Update profile
  exports.updateProfile = async (req, res) => {
    try {
      const { Name, Email, Address, Phone } = req.body;
      const { id, role } = req.user;
  
      // Find user based on role
      const Model = role === 'Customer' ? Customer : Admin;
      const user = await Model.findByPk(id);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
  
      // Handle image upload
      if (req.files && req.files.Image) {
        const result = await uploadImageToCloudinary(req.files.Image, process.env.FOLDER_NAME);
        user.Image = result.secure_url;
      }
  
      // Update user info
      user.Name = Name || user.Name;
      user.Email = Email || user.Email;
      user.Address = Address || user.Address;
      user.Phone = Phone || user.Phone;
  

      await user.save();
  
      // Fetch fresh user data after update
      const updatedUser = await Model.findByPk(id, {
        attributes: { exclude: ['Password'] } // Exclude password from response
      });
  
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
  
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error updating profile'
      });
    }
  };


  // Change Password
  exports.changePassword = async (req, res) => {
    try {
      const id = req.user.id;
      const role = req.user.role;
      const { currentPassword, newPassword } = req.body;
      let user;
      if(role === 'Admin'){ 
         user = await Admin.findByPk(id, {
          attributes: ['Password']
        });
      }
      else{
         user = await Customer.findByPk(id, {
          attributes: ['Password']
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.Password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid old password'
        });
      }
      const salt = 10;
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.Password = hashedPassword;
      if(role === 'Admin') {
        await Admin.update(
            { Password: hashedPassword },
            { where: { AdminID: id } }
        );
    } else {
        await Customer.update(
            { Password: hashedPassword },
            { where: { CustomerID: id } }
        );
    }
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    }
    catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error changing password'
      });
    }
  }
// Generate and send OTP
exports.forgotPassword = async (req, res) => {
  try {
      const { Email } = req.body;
      
      let user = await Customer.findOne({ where: { Email } });
      
      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      // Store OTP with 10 minutes expiry
      await OTP.create({
          email: Email,
          otp: otp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });

      // Send OTP email
      await mailSender(
        Email,
        'Password Reset OTP - Industrial Goods',
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                .otp-box { 
                    background: #f5f5f5; 
                    padding: 20px; 
                    margin: 20px 0; 
                    border-left: 4px solid #1a73e8; 
                    font-size: 24px; 
                    text-align: center; 
                    letter-spacing: 3px;
                }
                .timer { color: #d93025; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .security-tips { background: #fafafa; padding: 15px; margin: 15px 0; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your Industrial Goods account password. Your One-Time Password (OTP) is:</p>
                    
                    <div class="otp-box">
                        <strong>${otp}</strong>
                    </div>
    
                    <p class="timer">⏰ This OTP will expire in 10 minutes</p>
    
                    <div class="security-tips">
                        <p><strong>Security Tips:</strong></p>
                        <ul>
                            <li>Never share your OTP with anyone</li>
                            <li>Our team will never ask for your OTP</li>
                            <li>Ensure you're on our official website</li>
                        </ul>
                    </div>
    
                    <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
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

      res.status(200).json({
          success: true,
          message: 'OTP sent to email'
      });
  } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
          success: false,
          message: error.message || 'Error generating OTP'
      });
  }
};

// Verify OTP and reset password
exports.verifyOTPAndResetPassword = async (req, res) => {
  try {
      const { Email, otp } = req.body;

      // Check OTP
      const otpRecord = await OTP.findOne({
          where: {
              email: Email,
              otp: otp,
              expiresAt: { [Op.gt]: new Date() }
          }
      });

      if (!otpRecord) {
          return res.status(400).json({
              success: false,
              message: 'Invalid or expired OTP'
          });
      }

      // Generate new password
      const newPassword = Math.random().toString(36).slice(-8);
      const salt = 10;
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password
      const user = await Customer.findOne({ where: { Email } });
      user.Password = hashedPassword;
      await user.save();

      // Delete used OTP
      await otpRecord.destroy();

      // Send new password email
      await mailSender(
        Email,
        'Your New Password - Industrial Goods',
        `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1a73e8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
                .password { background: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #1a73e8; font-size: 18px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .button { background: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .warning { color: #d93025; margin-top: 15px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Successful</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>Your password has been successfully reset. Here's your new password:</p>
                    
                    <div class="password">
                        <strong>${newPassword}</strong>
                    </div>
    
                    <p><strong>Important Security Tips:</strong></p>
                    <ul>
                        <li>Please change this password immediately after logging in</li>
                        <li>Create a strong password using numbers, letters, and special characters</li>
                        <li>Never share your password with anyone</li>
                    </ul>
    
                    <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account</a>
    
                    <p class="warning">
                        If you didn't request this password reset, please contact our support team immediately.
                    </p>
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

      res.status(200).json({
          success: true,
          message: 'New password sent to email'
      });
  } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
          success: false,
          message: error.message || 'Error verifying OTP'
      });
  }
};
