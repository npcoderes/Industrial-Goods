const express = require('express');
const router = express.Router();
const { createCategory, updateCategory, getAllCategories, createProduct, getAllProducts, updateProduct, deleteProduct, getProductById, fetchOrders ,updateOrderStatus,handleReturnOrReplaceRequest,generateReport} = require('../controllers/admin');
const { auth } = require('../middleware/auth');

// category routes 
router.post('/createCategory', auth, createCategory);
router.put('/updateCategory', auth, updateCategory);
router.get('/getCategories',  getAllCategories);

// product routes

router.post('/createProduct', auth, createProduct);
router.get('/getProducts', getAllProducts);
router.put('/updateProduct', auth, updateProduct);
router.delete('/deleteProduct/:ProductID', auth, deleteProduct);
router.get('/getProductById/:ProductID', getProductById);


// order routes
router.get('/orders', auth, fetchOrders);
router.put('/orders/updateOrderStatus', auth, updateOrderStatus);
router.post('/orders/handleReturnOrReplaceRequest', auth, handleReturnOrReplaceRequest);
router.get('/generateReport', auth, generateReport);








module.exports = router;