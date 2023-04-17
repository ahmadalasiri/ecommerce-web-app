const express = require("express");

const authController = require("../controller/authController");

const {
    getSubCategory,
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    createFilterObject,
    setCategoryToBody,
} = require("../controller/subCategoryController");

const {
    getSubCategoryValidator,
    createSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(createFilterObject, getSubCategories)
    .post(
        authController.protect,
        authController.allowedTo("admin", "manager"),
        setCategoryToBody,
        createSubCategoryValidator,
        createSubCategory
    );

router
    .route("/:id")
    .get(getSubCategoryValidator, getSubCategory)
    .put(
        authController.protect,
        authController.allowedTo("admin", "manager"),
        updateSubCategoryValidator,
        updateSubCategory
    )
    .delete(
        authController.protect,
        authController.allowedTo("admin"),
        deleteSubCategoryValidator,
        deleteSubCategory
    );
module.exports = router;
