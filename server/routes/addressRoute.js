const express = require("express");

const authController = require("../controller/authController");

const {
    addAddress,
    deleteAddress,
    getLoggedUserAddresses,
} = require("../controller/addressController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router.route("/").get(getLoggedUserAddresses).post(addAddress);
router.route("/:addressId").delete(deleteAddress);

module.exports = router;
