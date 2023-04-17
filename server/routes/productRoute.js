const express = require("express");

const router = express.Router();

const authController = require("../controller/authController");

const {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
    uploadProductImages,
    resizeProductImages,
} = require("../controller/productController");

const {
    createProductValidator,
    deleteProductValidator,
    getProductValidator,
    updateProductValidator,
} = require("../utils/validators/productValidator");

const reviewRoute = require("./reviewRoute");

// Nested route
// POST  /products/:productId/reviews
// GET   /products/:productId/reviews
// GET   /products/:productId/reviews/:reviewId
router.use("/:productId/reviews", reviewRoute);

router
    .route("/")
    .get(getProducts)
    .post(
        authController.protect,
        authController.allowedTo("admin", "manager"),
        uploadProductImages,
        resizeProductImages,
        createProductValidator,
        createProduct
    );

router
    .route("/:id")
    .get(getProductValidator, getProduct)
    .put(
        authController.protect,
        authController.allowedTo("admin", "manager"),
        uploadProductImages,
        resizeProductImages,
        updateProductValidator,
        updateProduct
    )
    .delete(
        authController.protect,
        authController.allowedTo("admin"),
        deleteProductValidator,
        deleteProduct
    );

module.exports = router;
