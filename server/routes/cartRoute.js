const express = require("express");

const router = express.Router();

const {
    addProductToCart,
    getLoggedUserCart,
    updateCartItemQuantity,
    deleteCartItem,
    clearCart,
    applyCoupon,
} = require("../controller/cartController");

const authController = require("../controller/authController");

router.use(authController.protect, authController.allowedTo("user"));

router
    .route("/")
    .get(getLoggedUserCart)
    .post(addProductToCart)
    .delete(clearCart);

router.put("/coupon", applyCoupon);

router.route("/:itemId").put(updateCartItemQuantity).delete(deleteCartItem);

module.exports = router;
