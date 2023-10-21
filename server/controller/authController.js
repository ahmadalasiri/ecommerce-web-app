const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

/**
 *  @description   Signup
 *  @route         GET /api/v1/auth/signup
 *  @access        Public
 */
exports.signup = asyncHandler(async (req, res, next) => {
    // 1- Create user
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    // 2- Generate token
    const token = createToken(user._id);

    res.status(201).json({ data: user, token });
});

/**
 *  @description   Login
 *  @route         GET /api/v1/auth/login
 *  @access        Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return next(new ApiError(`Incorrect email or password`, 401));
    }
    //  Generate token
    const token = createToken(user._id);

    res.status(200).json({ data: user, token });
});

/**
 *  @description   make sure the user is logged in
 */
exports.protect = asyncHandler(async (req, res, next) => {
    // 1- Check if token exist
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new ApiError(
                `You are not authorized, you must login to get access this route`,
                401
            )
        );
    }

    // 2- Verify that the token has not changed
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3- Check if the user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
        return next(
            new ApiError(
                "The user that belongs to this token no longer exists",
                401
            )
        );
    }

    // Check if user change his password after token created
    if (user.passwordChangedAt) {
        const passChangedIimestamp = parseInt(
            user.passwordChangedAt.getTime() / 1000,
            10
        );
        // Password changed after token created (error)
        if (passChangedIimestamp > decoded.iat) {
            return next(
                new ApiError(
                    "User recently changed his password, please login againg.."
                )
            );
        }
    }

    req.user = user;
    next();
});

// Authorization (user permissions)
// ["admin", "manager"]
exports.allowedTo =
    (...roles) =>
        (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return next(
                    new ApiError("You are not allowed to access this route", 403)
                );
            }
            next();
        };

/**
 *  @description  Forgot password
 *  @route        POST /api/v1/auth/forgotPassword
 *  @access       Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // 1- Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new ApiError(`There is on user with that email ${req.body.email}`)
        );
    }

    // 2- if user exist, Generate resest random 6 digits and save it in db
    const resetCode = Math.floor(100000 + Math.random() * 90000).toString();
    const hashedResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");
    // Save hashed password reset code into db
    user.passwordResetCode = hashedResetCode;
    // Add expiration time for password reset code (10 min)
    user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    // 3- Send the reset code via email
    const message = `Hi ${user.name}, \nwe received a request to reset the password on your E-shop Account.
    ${resetCode} \nEnter this code to complete the reset.\nThanks for helping us keep your account secure.`;
    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset code (valid for 10 min)",
            message,
        });
    } catch (err) {
        user.passwordResetCode = undefined;
        user.passwordResetCodeExpires = undefined;
        user.passwordResetVerified = undefined;

        await user.save();
        return next(new ApiError("There is an error in sending email"), 500);
    }
    res.status(200).json({
        status: "Success",
        message: "Reset code sent to email",
    });
});

/**
 *  @description  Verify password reset code
 *  @route        POST /api/v1/auth/verifyResetCode
 *  @access       Public
 */
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    // 1- Get user based on reset code
    const hashedResetCode = crypto
        .createHash("sha256")
        .update(req.body.resetCode)
        .digest("hex");

    const user = await User.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetCodeExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new ApiError("Reset code invalid or expired"));
    }

    // 2- Reset code valid
    user.passwordResetVerified = true;

    await user.save();

    res.status(200).json({
        status: "Success",
    });
});

/**
 *  @description  Reset password
 *  @route        PUT /api/v1/auth/resetNewPassword
 *  @access       Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1- Get user based on email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError("There is no user for this email", 400));
    }
    // 2- Check if reset code if verified
    if (!user.passwordResetVerified) {
        return next(new ApiError("Reset code not verified", 400));
    }

    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetVerified = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    // 3- generate token
    const token = createToken(user._id);

    res.status(200).json({ token });
});
