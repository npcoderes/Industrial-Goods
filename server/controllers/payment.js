const Products = require('../models/products');
const Customer = require('../models/customer');
const Invoice = require('../models/Invoice');
const PurchaseHistory = require('../models/purchaseHistory');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv')
const instance = require('../config/razorpay');
dotenv.config();

// Configure Razorpay

// Capture Payment Controller
exports.capturePayment = async (req, res) => {
    const { products } = req.body; // Expect an array of product IDs and quantities
    const CustomerID = req.user.id; // Authenticated user's ID

    if (!products || products.length === 0) {
        return res.status(400).json({ success: false, message: 'No products provided for purchase.' });
    }

    let totalAmount = 0;
    let productDetails = [];

    try {
        // Validate products and calculate the total amount
        for (const item of products) {
            const { ProductID, quantity } = item;

            const product = await Products.findByPk(ProductID);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${ProductID} not found.` });
            }

            if (product.Stock < quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.Name}.` });
            }

            totalAmount += product.Price * quantity;
            productDetails.push({ product, quantity });
        }

        // Create a Razorpay order
        const orderOptions = {
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `order_${Date.now()}`,
        };

        const paymentResponse = await instance.instance.orders.create(orderOptions);

        return res.status(200).json({
            success: true,
            orderId: paymentResponse.id,
            amount: paymentResponse.amount,
            currency: paymentResponse.currency,
            products: productDetails,
        });
    } catch (error) {
        console.error('Error capturing payment:', error);
        return res.status(500).json({ success: false, message: 'Error capturing payment.', error: error.message });
    }
};

// Verify Payment Controller
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, products,deliveryAddress } = req.body;
    const CustomerID = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !products || !deliveryAddress) {
        return res.status(400).json({ success: false, message: 'Payment verification failed: Missing required data.' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET)
        .update(body)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
    }

    try {
        // Update purchase history and invoice
        let totalAmount = 0;
        const invoices = [];

        for (const item of products) {
            const { ProductID, quantity } = item;

            const product = await Products.findByPk(ProductID);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${ProductID} not found.` });
            }

            if (product.Stock < quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for product ${product.Name}.` });
            }

            const totalPrice = product.Price * quantity;
            totalAmount += totalPrice;

            // Create purchase history entry
            await PurchaseHistory.create({
                CustomerID: CustomerID,
                ProductID: ProductID,
                Quantity: quantity,
                TotalPrice: totalPrice,
                deliveryAddress:deliveryAddress,
                
            });

            // Update product stock
            await product.update({ Stock: product.Stock - quantity });

            // Create an invoice
            const invoice = await Invoice.create({
                CustomerID: CustomerID,
                InvoiceDate: new Date(),
                TotalPrice: totalPrice,
                PaymentMethod: 'Razorpay',
                ProductId: ProductID,
                Quantity: quantity,
            });

            invoices.push(invoice);
        }

        return res.status(200).json({
            success: true,
            message: 'Payment verified and purchase completed.',
            invoices,
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(500).json({ success: false, message: 'Error verifying payment.', error: error.message });
    }
};
