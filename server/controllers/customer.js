const PurchaseHistory = require('../models/purchaseHistory');
const Customer = require('../models/customer');
const Products = require('../models/products');
const  sequelize  = require('../config/sqldb');


exports.getPurchaseHistory = async (req, res) => {
    const CustomerID = req.user.id; // Authenticated user's ID


    try {
        const history = await PurchaseHistory.findAll({
            where: { CustomerID: CustomerID },
            include: [Products],
        });

        return res.status(200).json({ success: true, history });
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch purchase history.' });
    }
};



exports.cancelOrder = async (req, res) => {
    const { historyId } = req.body;
    const CustomerID = req.user.id;

    try {
        // Find order with customer validation
        const order = await PurchaseHistory.findOne({
            where: {
                HistoryID: historyId,
                CustomerID: CustomerID
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        // Validate order status
        const allowedStatusForCancel = ['Order Placed', 'Processing'];
        if (!allowedStatusForCancel.includes(order.Status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be canceled in current status.'
            });
        }

        // Start transaction
        const t = await sequelize.transaction();

        try {
            // Update order status
            await order.update({
                Status: 'Canceled',
                CancelledAt: new Date()
            }, { transaction: t });

            // Update product stock
            await Products.increment({
                Stock: order.Quantity
            }, {
                where: { ProductID: order.ProductID },
                transaction: t
            });

            await t.commit();

            return res.status(200).json({
                success: true,
                message: 'Order canceled successfully.'
            });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel order.'
        });
    }
};;



exports.requestReturnOrReplace = async (req, res) => {
    const { historyId, requestType, reason } = req.body;
    const CustomerID = req.user.id;

    // Validate request parameters
    if (!historyId || !requestType || !reason.trim()) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields.' 
        });
    }

    if (!['Return', 'Replace'].includes(requestType)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid request type.' 
        });
    }

    try {
        // Find order with customer validation
        const order = await PurchaseHistory.findOne({
            where: {
                HistoryID: historyId,
                CustomerID: CustomerID,
                Status: 'Delivered'
            }
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found or not eligible for return/replace.' 
            });
        }

        // Check 15-day return window
        const deliveryDate = new Date(order.updatedAt);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - deliveryDate) / (1000 * 60 * 60 * 24));

        if (daysDifference > 15) {
            return res.status(400).json({
                success: false,
                message: 'Return/Replace window (15 days) has expired.'
            });
        }

        // Start transaction
        const t = await sequelize.transaction();

        try {
            // Update order status
            await order.update({
                RequestType: requestType,
                RequestReason: reason,
                Status: 'Pending Approval',
                RequestDate: new Date()
            }, { transaction: t });

            await t.commit();

            return res.status(200).json({
                success: true,
                message: `${requestType} request submitted successfully.`
            });

        } catch (error) {
            await t.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error creating request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create request.'
        });
    }
};




