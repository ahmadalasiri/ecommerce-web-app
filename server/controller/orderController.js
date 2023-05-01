const asyncHandler = require("express-async-handler");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const ApiError = require("../utils/apiError");
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const factory = require("./handlersFactory");
const Product = require("../models/productModel");

/**
 *  @description    Create cach order
 *  @route          POST /api/v1/orders/cartId
 *  @access         Protected/user
 */
exports.createCachOrder = asyncHandler(async (req, res, next) => {
    // 1-   Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart)
        return next(
            new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
        );

    // 2-   Get order price depend on cart price (check if coupon apply)
    const cartPrice = cart.totalCartPriceAfterDiscount
        ? cart.totalCartPriceAfterDiscount
        : cart.totalCartPrice;

    const totalOrderPrice = cartPrice;

    // 3-   Create order with default payment method (cach)
    const order = await Order.create({
        user: req.user._id,
        cartItems: cart.cartItems,
        shippingAddress: req.body.shippingAddress,
        totalOrderPrice,
    });
    if (order) {
        // 4-   Decrement product quantity, increment product sold
        const bulkOption = cart.cartItems.map((item) => ({
            updateOne: {
                filter: { _id: item.product },
                update: {
                    $inc: { quantity: -item.quantity, sold: item.quantity },
                },
            },
        }));
        await Product.bulkWrite(bulkOption, {});

        // 5-   Clear cart
        await Cart.findByIdAndDelete(req.params.cartId);
    }
    res.status(201).json({
        status: "Success",
        data: order,
    });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
    if (req.user.role === "user") req.filterObject = { user: req.user._id };
    next();
});

/**
 *  @description    Get orders
 *  @route          GET /api/v1/orders
 *  @access         Protected/user-manager-admin
 */
exports.getOrders = factory.getAll(Order);

/**
 *  @description    Get orders
 *  @route          GET /api/v1/orders/id
 *  @access         Protected/user-manager-admin
 */
exports.getOrder = factory.getOne(Order);

/**
 *  @description    Update order to paid
 *  @route          GET /api/v1/orders/:id/pay
 *  @access         Protected/manager-admin
 */
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order)
        return next(
            new ApiError(`There is no order with id ${req.params.id}`, 404)
        );

    // update order to paid
    order.isPaid = true;
    order.paidAt = Date.now();

    await order.save();
    res.status(200).json({ status: "success", data: order });
});

/**
 *  @description    Update order to delivered
 *  @route          GET /api/v1/orders/:id/deliver
 *  @access         Protected/manager-admin
 */
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order)
        return next(
            new ApiError(`There is no order with id ${req.params.id}`, 404)
        );

    // update order to paid
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    await order.save();

    res.status(200).json({ status: "success", data: order });
});

/**
 *  @description    Create checkout session with stripe
 *  @route          POST /api/v1/orders/checkout-session/cartId
 *  @access         Protected/User
 */

exports.checkoutSession = asyncHandler(async (req, res, next) => {
    // 1-   Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart)
        return next(
            new ApiError(`There is no cart with id ${req.params.cartId}`, 404)
        );

    // 2-   Get order price depend on cart price (check if coupon apply)
    const cartPrice = cart.totalCartPriceAfterDiscount
        ? cart.totalCartPriceAfterDiscount
        : cart.totalCartPrice;

    const totalOrderPrice = cartPrice;

    // 3- Create stripe checkout session
    const price = await stripe.prices.create({
        unit_amount: totalOrderPrice * 100,
        currency: "egp",
        product_data: {
            name: "My product",
        },
    });
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/api/v1/orders`,
        cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
    });
    // 4- send session to response
    res.status(200).json({ status: "success", session });
});

exports.webhookCheckout = (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        console.log("create order here...");
    }
};
