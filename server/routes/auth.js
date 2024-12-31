const express = require('express');
const router = express.Router();

const { login, signup, updateProfile ,forgotPassword,verifyOTPAndResetPassword,changePassword,initiateSignup,verifySignupOTP} = require('../controllers/auth');
const {signupAdmin} = require('../controllers/admin');
const {auth} = require('../middleware/auth');

router.post('/login', login);
router.post('/initiate-signup', initiateSignup);
router.post('/verify-signup-otp', verifySignupOTP);
router.post('/signupAdmin', signupAdmin);
router.put('/update-profile',auth,updateProfile)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTPAndResetPassword);
router.put('/change-password',auth,changePassword)

module.exports = router;