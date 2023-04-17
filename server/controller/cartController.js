const asyncHandler = require("express-async-handler");

const Cart = require("../models/cartModel");
const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

const calcTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.cartItems.forEach((item) => {
        totalPrice += item.price * item.quantity;
    });
    cart.totalCartPriceAfterDiscount = undefined;
    return totalPrice;
};

/**
 *  @description Add product to cart
 *  @route       POST /api/v1/cart
 *  @access      Private/user
 */
exports.addProductToCart = asyncHandler(async (req, res, next) => {
    const { productId, color } = req.body;

    const product = await Product.findById(productId);
    // Get cart for logged user
    let cart = await Cart.findOne({
        user: req.user._id,
    });

    if (!cart) {
        // Create cart for logged user with product
        cart = await Cart.create({
            user: req.user._id,
            cartItems: [{ product: productId, color, price: product.price }],
        });
    } else {
        // product exists in cart, update product quantity
        const productIndex = cart.cartItems.findIndex(
            (item) =>
                item.product.toString() === productId && item.color === color
        );
        if (productIndex > -1) {
            const cartItem = cart.cartItems[productIndex];
            cartItem.quantity += 1;
        } else {
            // product not exist in cart, push product to cartItems array
            cart.cartItems.push({
                product: productId,
                color,
                price: product.price,
            });
        }
    }

    // Calculate total cart price
    cart.totalCartPrice = calcTotalCartPrice(cart);

    await cart.save();

    res.status(200).json({
        status: "Success",
        message: "Product added to cart successfully",
        data: cart,
    });
});

/**
 *  @description Get logged user  cart
 *  @route       POST /api/v1/cart
 *  @access      Private/user
 */
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart)
        return next(
            new ApiError(
                `There is no cart for this user id ${req.user._id}`,
                404
            )
        );
    res.status(200).json({
        status: "Success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

/**
 *  @description Remove cart item
 *  @route       DELETE /api/v1/cart
 *  @access      Private/user
 */
exports.deleteCartItem = asyncHandler(async (req, res, next) => {
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        {
            // pop item form array
            $pull: { cartItems: { _id: req.params.itemId } },
        },
        { new: true }
    );
    cart.totalCartPrice = calcTotalCartPrice(cart);
    cart.save();

    res.status(200).json({
        status: "Success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

/**
 *  @description clear logged user cart
 *  @route       DELETE /api/v1/cart/:itemId
 *  @access      Private/user
 */
exports.clearCart = asyncHandler(async (req, res, next) => {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(204).send();
});

/**
 *  @description Update cart item quantity
 *  @route       PUT /api/v1/cart/:itemId
 *  @access      Private/user
 */
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(
            new ApiError(`There is no cart for user ${req.user._id}`, 404)
        );
        // throw new ApiError(`There is no cart for user ${req.user._id}`, 404);
        // return Promise.reject(
        //     new ApiError(`There is no cart for user ${req.user._id}`, 404)
        // );
    }
    const itemIndex = cart.cartItems.findIndex(
        (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity = quantity;
    } else {
        return next(
            new ApiError(
                `There is no item for the id ${req.params.itemId}`,
                404
            )
        );
    }
    cart.totalCartPrice = calcTotalCartPrice(cart);
    await cart.save();
    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});

/**
 *  @description Apply coupon on logged user cart
 *  @route       PUT /api/v1/cart/coupon
 *  @access      Private/user
 */
exports.applyCoupon = asyncHandler(async (req, res, next) => {
    // 1- get coupon based on coupon name
    const coupon = await Coupon.findOne({
        name: req.body.coupon,
        expire: { $gt: Date.now() },
    });

    if (!coupon) return next(new ApiError(`Coupon invalid or expired`));

    // 2- get logged user cart to get
    const cart = await Cart.findOne({ user: req.user._id });

    const totalPrice = cart.totalCartPrice;

    cart.totalCartPriceAfterDiscount = (
        totalPrice -
        (totalPrice * coupon.discount) / 100
    ).toFixed(2);

    await cart.save();

    res.status(200).json({
        status: "success",
        numOfCartItems: cart.cartItems.length,
        data: cart,
    });
});
