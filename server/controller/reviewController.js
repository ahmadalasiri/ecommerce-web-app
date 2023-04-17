const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

// Nested route
// GET    /api/v1/categories/:categoryId/subcategories
exports.createFilterObject = (req, res, next) => {
    let filterObject = {};
    if (req.params.categoryId)
        filterObject = { mainCategory: req.params.categoryId };
    req.filterObject = filterObject;
    next();
};

// Nested route (create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user._id;
    next();
};
/**
 *  @description Get list of reviews
 *  @route       GET /api/v1/reviews
 *  @access      Public
 */
exports.getReviews = factory.getAll(Review);

/**
 *  @description Get review
 *  @route       GET /api/v1/reviews/:id
 *  @access      Public
 */
exports.getReview = factory.getOne(Review);

/**
 *  @description Create review
 *  @route       POST /api/v1/reviews
 *  @access      Private/Protect/User
 */
exports.createReview = factory.createOne(Review);

/**
 *  @description Update review
 *  @route       POST /api/v1/reviews/:id
 *  @access      Private/Protect/User
 */
exports.updateReview = factory.updateOne(Review);

/**
 *  @description Delete review
 *  @route       DELETE /api/reviews/:id
 *  @access      Private/Protect/User-Admin-Manager
 */
exports.deleteReview = factory.deleteOne(Review);
