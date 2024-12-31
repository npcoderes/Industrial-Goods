const express = require('express');
const router = express.Router();

const{createCustomer,getCustomers,updateCustomer,deleteCustomer}=require('../controllers/manageuser');

router.post('/createCustomer',createCustomer);
router.get('/getCustomers',getCustomers);
router.put('/updateCustomer/:id',updateCustomer);
router.delete('/deleteCustomer/:id',deleteCustomer);




module.exports = router;
