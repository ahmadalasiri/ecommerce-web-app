const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const slugify = require("slugify");

exports.createProductValidator = [
    check("title")
        .isLength({ min: 2 })
        .withMessage("title length must be at least 2 chars")
        .notEmpty()
        .withMessage("Product is required")
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("description")
        .notEmpty()
        .withMessage("product description is required")
        .isLength({ min: 20 })
        .withMessage("Too short description"),
    check("quantity")
        .notEmpty()
        .withMessage("product quantity is is required")
        .isNumeric()
        .withMessage("Product quantity must be number"),
    check("sold")
        .optional()
        .isNumeric()
        .withMessage("product sales must be number"),
    check("price")
        .notEmpty()
        .withMessage("Product price is required ")
        .isNumeric()
        .withMessage("Product price must be number")
        .isLength({ max: 20 })
        .withMessage("Too long price"),
    check("priceAfterDiscount")
        .optional()
        .isFloat()
        .isNumeric()
        .withMessage("priceAfterDiscount must be a number")
        .custom((value, { req }) => {
            if (req.body.price <= value) {
                throw new Error("priceAfterDiscount must be lower than price");
            }
            return true;
        }),
    check("colors")
        .optional()
        .isArray()
        .withMessage("colors shoude be array of string"),
    check("imageCover").notEmpty().withMessage("imagecover is required"),
    check("images")
        .optional()
        .isArray()
        .withMessage("images should be array of string"),
    check("category")
        .notEmpty()
        .withMessage("Product must belong to  a main category")
        .isMongoId()
        .withMessage("Invalid category id formate")
        .custom(async (categoryId) => {
            await Category.findById(categoryId).then((category) => {
                if (!category)
                    return Promise.reject(
                        new Error(`No category for this id ${categoryId}`)
                    );
            });
        }),
    check("subcategories")
        .optional()
        .isMongoId()
        .withMessage("Invalid subcategory id formate")
        // Check if subcategories ids exists in db
        .custom(async (subcategoriesIds) => {
            await SubCategory.find({
                _id: { $exists: true, $in: subcategoriesIds },
            }).then((result) => {
                if (result.length !== subcategoriesIds.length) {
                    return Promise.reject(
                        new Error(`Invalid subcategories ids `)
                    );
                }
            });
        })
        .custom(async (val, { req }) => {
            await SubCategory.find({
                category: req.body.category,
            }).then((subcategories) => {
                let subcategoriesInDB = [];
                subcategories.forEach((subcategory) => {
                    subcategoriesInDB.push(subcategory._id.toString());
                });
                // check if subcategories belong to main category
                const checker = val.every((v) => subcategoriesInDB.includes(v));
                if (!checker) {
                    return Promise.reject(
                        new Error("subcategories not belong to main category")
                    );
                }
            });
        }),

    check("brand")
        .optional()
        .isMongoId()
        .withMessage("Invalid brand id formate"),
    check("ratingAverage")
        .optional()
        .isNumeric()
        .withMessage("ratingAvarage must be a number")
        .isLength({ min: 1 })
        .withMessage("Rating must be above of equal to 1.0")
        .isLength({ max: 5 })
        .withMessage("Rating must be below of equal to 5.0"),
    check("retingQuantity")
        .optional()
        .isNumeric()
        .withMessage("ratingQuantity must be a number"),
    validatorMiddleware,
];

exports.getProductValidator = [
    check("id").isMongoId().withMessage("Invalid product id formate"),
    validatorMiddleware,
];

exports.updateProductValidator = [
    check("id").isMongoId().withMessage("Invalid product id formate"),
    body("title")
        .optional()
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    validatorMiddleware,
];

exports.deleteProductValidator = [
    check("id").isMongoId().withMessage("Invalid product id formate"),
    validatorMiddleware,
];
