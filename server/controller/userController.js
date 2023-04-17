const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleFile } = require("../middleware/uploadImageMiddleware");
const User = require("../models/userModel");
const createToken = require("../utils/createToken");

// Upload single image
exports.uploadUserImage = uploadSingleFile("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `user-${uuidv4()}-${Date.now()}.png`;
    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat("png")
            .png({ quality: 90 })
            .toFile(`uploads/users/${filename}`);
        // Save image into db
        req.body.profileImg = filename;
    }
    next();
});

/**
 *  @description Get list of users
 *  @route       GET /api/v1/users
 *  @access      Private/Admin/
 */
exports.getUsers = factory.getAll(User);

/**
 *  @description Get User
 *  @route       GET /api/v1/Users/:id
 *  @access      Private/Admin
 */
exports.getUser = factory.getOne(User);

/**
 *  @description Create User
 *  @route       POST /api/v1/User
 *  @access      Private/Admin
 */
exports.createUser = factory.createOne(User);

/**
 *  @description Update User
 *  @route       PUT /api/v1/User/:id
 *  @access      Private/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            slug: req.body.slug,
            phone: req.body.phone,
            email: req.body.email,
            profileImg: req.body.profileImg,
            role: req.body.role,
        },
        {
            new: true,
        }
    );

    if (!user) {
        return next(new ApiError(`No user for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: user });
});

/**
 *  @description Update User password
 *  @route       PUT /api/v1/user/:id
 *  @access      Private/Admin
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            password: await bcrypt.hash(req.body.password, 5),
            passwordChangedAt: Date.now(),
        },
        { new: true }
    );

    if (!user) {
        return next(new ApiError(`No user for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: user });
});

/**
 *  @description Delete User
 *  @route       DELETE /api/user/:id
 *  @access      Private/Admin
 */
exports.deleteUser = factory.deleteOne(User);

/**
 *  @description    Get logged user data
 *  @route          GET /api/users/getMe
 *  @access         Private/Protect
 */
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
    res.status(200).json({ data: req.user });
});

/**
 *  @description    Update logged user password
 *  @route          PUT /api/users/updateMyPassword
 *  @access         Private/Protect
 */
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
    // 1- Update user password based on user payload (req.user._id)
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            password: await bcrypt.hash(req.body.password, 5),
            passwordChangedAt: Date.now(),
        },
        { new: true }
    );
    const token = createToken(user._id);
    res.status(200).json({ data: user, token });
});

/**
 *  @description    Update logged user data without(password, role)
 *  @route          PUT /api/users/updateMe
 *  @access         Private/Protect
 */
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        },
        { new: true }
    );

    res.status(200).json({ data: user });
});

/**
 *  @description    Deactivate logged user
 *  @route          Delete /api/users/deleteMe
 *  @access         Private/Protect
 */
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
    await User.findOneAndUpdate(req.user._id, { active: false });

    res.status(204).json({ status: "Success" });
});
