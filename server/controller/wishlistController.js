const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

/**
 *  @description    Add product to wishlist
 *  @route          POST /api/v1/wishlist
 *  @access         Protected/User
 */
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
    //   $addToSet => add product to wishlist array if product in not existing
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $addToSet: { wishlist: req.body.productId },
        },
        { new: true }
    );
    res.status(200).json({
        status: "success",
        message: "Product added successfully to your wishlist",
        data: user.wishlist,
    });
});

/**
 *  @description    Remove product to wishlist
 *  @route          DELETE /api/v1/wishlist
 *  @access         Protected/User
 */
exports.deleteProductFromWishlist = asyncHandler(async (req, res, next) => {
    // $pull => remove product from wishlist array if product  exist
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { wishlist: req.params.productId },
        },
        { new: true }
    );
    res.status(200).json({
        status: "success",
        message: "Product removed successfully form your wishlist",
        data: user.wishlist,
    });
});

/**
 *  @description    Get product from wishlist
 *  @route          GET /api/v1/wishlist
 *  @access         Protected/User
 */
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({
        status: "success",
        result: user.wishlist.length,
        data: user.wishlist,
    });
});
