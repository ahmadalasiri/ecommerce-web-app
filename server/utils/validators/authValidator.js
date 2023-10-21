const { check } = require("express-validator");
const { default: slugify } = require("slugify");

const User = require("../../models/userModel");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.signupValidator = [
    check("name")
        .notEmpty()
        .withMessage("User name is required")
        .isLength({ min: 2 })
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("email")
        .notEmpty()
        .withMessage("User email is required")
        .isEmail()
        .withMessage("invalid email address")
        .custom(async (val, { req }) => {
            await User.findOne({ email: val }).then((user) => {
                if (user) {
                    return Promise.reject(new Error(`E-mail already in user`));
                }
            });
        }),
    check("password")
        .notEmpty()
        .withMessage("password required")
        .isLength({ min: 6 })
        .withMessage("password must be at least 6 charachters")
        .custom((password, { req }) => {
            if (password !== req.body.passwordConfirm) {
                throw new Error("password confirmation incorrect");
            }
            return true;
        }),
    check("passwordConfirm")
        .notEmpty()
        .withMessage("password confirm required"),
    validatorMiddleware,
];

exports.loginValidator = [
    check("email")
        .notEmpty()
        .withMessage("User email is required")
        .isEmail()
        .withMessage("invalid email address"),

    check("password")
        .notEmpty()
        .withMessage("password required")
        .isLength({ min: 6 })
        .withMessage("password must be at least 6 charachters"),
    validatorMiddleware,
];
