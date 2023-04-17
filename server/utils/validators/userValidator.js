const { check, body } = require("express-validator");
const { default: slugify } = require("slugify");
const bcrypt = require("bcryptjs");

const User = require("../../models/userModel");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

exports.createUserValidator = [
    check("name")
        .notEmpty()
        .withMessage("User name is required")
        .isLength({ min: 2 })
        .withMessage("User name is too long")
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
    check("profileImg").optional(),
    check("phone")
        .optional()
        .isMobilePhone(["ar-EG", "ar-SA"])
        .withMessage("Invalid phone number"),
    check("role").optional(),
    validatorMiddleware,
];

exports.getUserValidator = [
    check("id")
        .notEmpty()
        .withMessage("User id is required")
        .isMongoId()
        .withMessage("Invalid brnad id format "),
    validatorMiddleware,
];

exports.updateUserValidator = [
    check("id")
        .notEmpty()
        .withMessage("User id is required")
        .isMongoId()
        .withMessage("Invalid user id format "),
    body("name")
        .optional()
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("email")
        .optional()
        .isEmail()
        .withMessage("invalid email address")
        .custom(async (email, { req }) => {
            await User.findOne({ email: email }).then((user) => {
                if (user) {
                    return Promise.reject(new Error(`E-mail already in user`));
                }
            });
        }),
    check("profileImg").optional(),
    check("phone")
        .optional()
        .isMobilePhone(["ar-EG", "ar-SA"])
        .withMessage("Invalid phone number"),
    check("role").optional(),
    validatorMiddleware,
];

exports.updateUserPasswordValidator = [
    body("currentPassword")
        .notEmpty()
        .withMessage("user must enter your current password"),
    body("passwordConfirm")
        .notEmpty()
        .withMessage("you must enter the password confirm"),
    body("password")
        .notEmpty()
        .withMessage("you must enter the new password")
        .custom(async (val, { req }) => {
            // Verify current password
            const user = await User.findById(req.params.id);
            if (!user) {
                throw new Error(`there is no user for this id`);
            }
            const isCorrectPassword = await bcrypt.compare(
                req.body.currentPassword,
                user.password
            );

            if (!isCorrectPassword) {
                throw new Error("incorrect current password");
            }
            // Verify password confirm
            if (val !== req.body.passwordConfirm) {
                throw new Error("password confirmation incorrect");
            }
            return true;
        }),
    validatorMiddleware,
];

exports.deleteUserValidator = [
    check("id")
        .notEmpty()
        .withMessage("User id is required")
        .isMongoId()
        .withMessage("Invalid brnad id format "),
    validatorMiddleware,
];

exports.updateLoggedUserValidator = [
    body("name")
        .optional()
        .custom((val, { req }) => {
            req.body.slug = slugify(val);
            return true;
        }),
    check("email")
        .optional()
        .isEmail()
        .withMessage("invalid email address")
        .custom(async (email, { req }) => {
            await User.findOne({ email: email }).then((user) => {
                if (user) {
                    return Promise.reject(new Error(`E-mail already in user`));
                }
            });
        }),
    check("profileImg").optional(),
    check("phone")
        .optional()
        .isMobilePhone(["ar-EG", "ar-SA"])
        .withMessage("Invalid phone number"),
    validatorMiddleware,
];

exports.updateLoggedUserValidatorPass = [
    body("currentPassword")
        .notEmpty()
        .withMessage("user must enter your current password"),
    body("passwordConfirm")
        .notEmpty()
        .withMessage("you must enter the password confirm"),
    body("password")
        .notEmpty()
        .withMessage("you must enter the new password")
        .custom(async (val, { req }) => {
            // Verify current password
            const user = await User.findById(req.user._id);
            if (!user) {
                throw new Error(`there is no user for this id`);
            }
            const isCorrectPassword = await bcrypt.compare(
                req.body.currentPassword,
                user.password
            );

            if (!isCorrectPassword) {
                throw new Error("incorrect current password");
            }
            // Verify password confirm
            if (val !== req.body.passwordConfirm) {
                throw new Error("password confirmation incorrect");
            }
            return true;
        }),
    validatorMiddleware,
];
