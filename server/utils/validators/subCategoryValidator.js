const { check, body } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createSubCategoryValidator = [
    check("name")
        .notEmpty()
        .withMessage("SubCategory name is reqiured")
        .isLength({ min: 2 })
        .withMessage("SubCategory name is too short")
        .isLength({ max: 32 })
        .withMessage("SubCategory name is too long")
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("mainCategory")
        .notEmpty()
        .withMessage("SubCategory must belong to main category")
        .isMongoId()
        .withMessage("Invalid category id format"),
    validatorMiddleware,
];

exports.getSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory id format"),
    validatorMiddleware,
];

exports.updateSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory id format"),

    body("name")
        .optional()
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
    check("id").isMongoId().withMessage("Invalid SubCategory id format"),
    validatorMiddleware,
];
