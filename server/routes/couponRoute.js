const express = require("express");

const router = express.Router();

const {
    createCoupon,
    deleteCoupon,
    getCoupon,
    getCoupons,
    updateCoupon,
} = require("../controller/couponController");

const authController = require("../controller/authController");

router.use(
    authController.protect,
    authController.allowedTo("admin", "manager")
);

router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
