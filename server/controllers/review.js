const Review = require('../models/Review');
const Product = require('../models/products');
const Customer = require('../models/customer');


// Add Review
exports.addReview = async (req, res) => {
    try {
        const { ProductID, Rating, ReviewText } = req.body;
        const CustomerID = req.user.id;

        // Check if user already reviewed
        // const existingReview = await Review.findOne({
        //     where: { ProductID, CustomerID }
        // });

        // if (existingReview) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'You have already reviewed this product'
        //     });
        // }

        // Create review
        const review = await Review.create({
            ProductID,
            CustomerID,
            Rating,
            ReviewText
        });

        // Update product average rating
        const reviews = await Review.findAll({
            where: { ProductID }
        });

        const avgRating = reviews.reduce((acc, curr) => acc + curr.Rating, 0) / reviews.length;

        // await Product.update(
        //     { AverageRating: avgRating, TotalReviews: reviews.length },
        //     { where: { ProductID } }
        // );
        const r=await Review.findAll({
            where: { ProductID },
            include: [{
                model: Customer,
                attributes: ['Name']
            }],
            order: [['CreatedAt', 'DESC']]
        });



        res.status(201).json({
            success: true,
            reviews:r
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review'
        });
    }
}

// Get Product Reviews
exports.getProductReviews = async (req, res) => {
    try {
        const { ProductID } = req.params;

        const reviews = await Review.findAll({
            where: { ProductID },
            include: [{
                model: Customer,
                attributes: ['Name']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
}


