const express = require("express");

const router = express.Router({ mergeParams: true });

const {
    getReviewValidator,
    createReviewValidator,
    deleteReviewValidator,
    updateReviewValidator,
} = require("../utils/validators/reviewValidator");

const {
    getReviews,
    createReview,
    deleteReview,
    getReview,
    updateReview,
    createFilterObject,
    setProductIdAndUserIdToBody,
} = require("../controller/reviewController");

const authController = require("../controller/authController");

router
    .route("/")
    .get(createFilterObject, getReviews)
    .post(
        authController.protect,
        authController.allowedTo("user"),
        setProductIdAndUserIdToBody,
        createReviewValidator,
        createReview
    );
router
    .route("/:id")
    .get(getReviewValidator, getReview)
    .put(
        authController.protect,
        authController.allowedTo("user"),
        updateReviewValidator,
        updateReview
    )
    .delete(
        authController.protect,
        authController.allowedTo("user", "admin", "manager"),
        deleteReviewValidator,
        deleteReview
    );

module.exports = router;
