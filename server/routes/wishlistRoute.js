const express = require("express");

const authController = require("../controller/authController");

const {
    addProductToWishlist,
    deleteProductFromWishlist,
    getLoggedUserWishlist,
} = require("../controller/wishlistController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router.route("/").get(getLoggedUserWishlist).post(addProductToWishlist);
router.route("/:productId").delete(deleteProductFromWishlist);

module.exports = router;
