const express = require("express");

const router = express.Router();

const authController = require("../controller/authController");

const {
    createUser,
    deleteUser,
    getUser,
    getUsers,
    updateUser,
    resizeImage,
    uploadUserImage,
    updateUserPassword,
    getLoggedUserData,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deleteLoggedUser,
} = require("../controller/userController");

const {
    createUserValidator,
    getUserValidator,
    updateUserValidator,
    deleteUserValidator,
    updateUserPasswordValidator,
    updateLoggedUserValidator,
    updateLoggedUserValidatorPass,
} = require("../utils/validators/userValidator");

router.use(authController.protect);

router.get("/getMe", getLoggedUserData);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUser);
router.put(
    "/updateMyPassword",
    updateLoggedUserValidatorPass,
    updateLoggedUserPassword
);

// Admin
router.use(authController.allowedTo("admin"));

router.put(
    "/ChangePassword/:id",
    updateUserPasswordValidator,
    updateUserPassword
);
router
    .route("/")
    .get(getUsers)
    .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
    .route("/:id")
    .get(getUserValidator, getUser)
    .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
    .delete(deleteUserValidator, deleteUser);

module.exports = router;
