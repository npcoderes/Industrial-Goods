const express = require('express');
const router = express.Router();
const {verifyPayment,capturePayment} = require('../controllers/payment')
const {getPurchaseHistory,cancelOrder,requestReturnOrReplace} = require('../controllers/customer')
const {auth} = require('../middleware/auth');

router.post('/capture',auth,capturePayment);
router.post('/verify',auth,verifyPayment);
router.get('/purchase-history',auth,getPurchaseHistory);
router.post('/cancel-order',auth,cancelOrder);
router.post('/request-return-or-replace',auth,requestReturnOrReplace);




module.exports = router;