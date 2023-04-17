const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");

const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createBrandValidator = [
    check("name")
        .notEmpty()
        .withMessage("Brand name is required")
        .isLength({ min: 3 })
        .withMessage("Brand name is too short")
        .isLength({ max: 32 })
        .withMessage("Brand name is too long")
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    validatorMiddleware,
];

exports.getBrandValidator = [
    check("id")
        .notEmpty()
        .withMessage("Brand id is required")
        .isMongoId()
        .withMessage("Invalid brnad id format "),
    validatorMiddleware,
];

exports.updateBrandValidator = [
    check("id")
        .notEmpty()
        .withMessage("Brand id is required")
        .isMongoId()
        .withMessage("Invalid brnad id format "),
    body("name")
        .optional()
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    validatorMiddleware,
];

exports.deleteBrandValidator = [
    check("id")
        .notEmpty()
        .withMessage("Brand id is required")
        .isMongoId()
        .withMessage("Invalid brnad id format "),
    validatorMiddleware,
];
