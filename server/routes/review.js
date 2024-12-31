const express = require('express');
const router = express.Router();
const { addReview, getProductReviews } = require('../controllers/review');
const {auth} = require('../middleware/auth');

router.post('/add',auth, addReview);
router.get('/:ProductID',auth, getProductReviews);

module.exports = router;