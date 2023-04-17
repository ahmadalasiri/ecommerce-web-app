const { check } = require("express-validator");

const Review = require("../../models/reviewModel");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createReviewValidator = [
    check("title").optional(),
    check("rating")
        .notEmpty()
        .withMessage("rating value required")
        .isFloat({ min: 1, max: 5 })
        .withMessage("Rating value must be between 1 to 5"),
    check("user").isMongoId().withMessage("Invalid user id format"),
    check("product")
        .isMongoId()
        .withMessage("Invalid product id format")
        // Check if logged user create review before
        .custom(async (val, { req }) => {
            const review = await Review.findOne({
                user: req.user._id,
                product: req.body.product,
            });
            if (review) {
                throw new Error("You already created a review befor");
            }
        }),
    validatorMiddleware,
];

exports.getReviewValidator = [
    check("id")
        .notEmpty()
        .withMessage("Review id is required")
        .isMongoId()
        .withMessage("Invalid review id format "),
    validatorMiddleware,
];

exports.updateReviewValidator = [
    check("id")
        .notEmpty()
        .withMessage("Review id is required")
        .isMongoId()
        .withMessage("Invalid Review id format ")
        .custom(async (val, { req }) => {
            const review = await Review.findOne({ _id: val });
            if (!review) {
                return Promise.reject(
                    new Error(`There is no review with id ${val}`)
                );
            }
            console.log(review.user);
            console.log(req.user._id);
            if (review.user._id.toString() !== req.user._id.toString()) {
                return Promise.reject(
                    new Error(`Your are not allowed to perform this action`)
                );
            }
        }),

    validatorMiddleware,
];

exports.deleteReviewValidator = [
    check("id")
        .notEmpty()
        .withMessage("Review id is required")
        .isMongoId()
        .withMessage("Invalid brnad id format ")
        .custom(async (val, { req }) => {
            const review = await Review.findById(val);
            if (req.user.role === "user") {
                if (!review) {
                    return Promise.reject(
                        new Error(`There is no review with id ${val}`)
                    );
                }

                if (review.user._id.toString() !== req.user._id.toString()) {
                    return Promise.reject(
                        new Error(`Your are not allowed to perform this action`)
                    );
                }
            }
        }),
    validatorMiddleware,
];
