const express = require("express");

const router = express.Router();

const authController = require("../controller/authController");
const {
    createCachOrder,
    getOrder,
    getOrders,
    updateOrderToDelivered,
    updateOrderToPaid,
    checkoutSession,
    filterOrderForLoggedUser,
} = require("../controller/orderController");

router.use(authController.protect);

router.post(
    "/checkout-session/:cartId",
    authController.allowedTo("user"),
    checkoutSession
);

router
    .route("/:cartId")
    .post(authController.allowedTo("user"), createCachOrder);

router.get(
    "/",
    authController.allowedTo("user", "admin", "manager"),
    filterOrderForLoggedUser,
    getOrders
);
router.get(
    "/:id",
    authController.allowedTo("user", "admin", "manager"),
    getOrder
);
router.put(
    "/:id/pay",
    authController.allowedTo("admin", "manager"),
    updateOrderToPaid
);
router.put(
    "/:id/deliver",
    authController.allowedTo("admin", "manager"),
    updateOrderToDelivered
);

module.exports = router;
