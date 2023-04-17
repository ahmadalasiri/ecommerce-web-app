const express = require("express");

const router = express.Router();

const {
    getBrands,
    createBrand,
    deleteBrand,
    getBrand,
    updateBrand,
    uploadBrandImage,
    resizeImage,
} = require("../controller/brandController");

const authController = require("../controller/authController");

const {
    getBrandValidator,
    createBrandValidator,
    deleteBrandValidator,
    updateBrandValidator,
} = require("../utils/validators/brandValidator");

router
    .route("/")
    .get(getBrands)
    .post(
        authController.protect,
        authController.allowedTo("admin", "manager"),
        uploadBrandImage,
        resizeImage,
        createBrandValidator,
        createBrand
    );
router
    .route("/:id")
    .get(getBrandValidator, getBrand)
    .put(
        authController.protect,
        authController.allowedTo("admin", "manager"),
        uploadBrandImage,
        resizeImage,
        updateBrandValidator,
        updateBrand
    )
    .delete(
        authController.protect,
        authController.allowedTo("admin"),
        deleteBrandValidator,
        deleteBrand
    );

module.exports = router;
