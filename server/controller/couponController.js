const factory = require("./handlersFactory");
const Coupon = require("../models/couponModel");

/**
 *  @description Get list of Coupons
 *  @route       GET /api/v1/coupons
 *  @access      Private/Admin-Manager
 */
exports.getCoupons = factory.getAll(Coupon);

/**
 *  @description Get Coupon
 *  @route       GET /api/v1/coupons/:id
 *  @access      Public
 */
exports.getCoupon = factory.getOne(Coupon);

/**
 *  @description Create coupon
 *  @route       POST /api/v1/Coupon
 *  @access      Private/Admin-Manager
 */
exports.createCoupon = factory.createOne(Coupon);

/**
 *  @description Update Coupon
 *  @route       POST /api/v1/Coupon/:id
 *  @access      Private/Admin-Manager
 */
exports.updateCoupon = factory.updateOne(Coupon);

/**
 *  @description Delete Coupon
 *  @route       DELETE /api/brnad/:id
 *  @access      Private/Admin-Manager
 */
exports.deleteCoupon = factory.deleteOne(Coupon);
