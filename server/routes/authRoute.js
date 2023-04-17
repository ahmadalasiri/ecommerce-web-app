const express = require("express");

const router = express.Router();

const {
    signup,
    login,
    forgotPassword,
    verifyPassResetCode,
    resetPassword,
} = require("../controller/authController");

const {
    signupValidator,
    loginValidator,
} = require("../utils/validators/authValidator");

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);

module.exports = router;
