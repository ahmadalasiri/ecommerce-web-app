const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const { uploadSingleFile } = require("../middleware/uploadImageMiddleware");
const Brand = require("../models/brandModel");

// Upload single image
exports.uploadBrandImage = uploadSingleFile("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `brand-${uuidv4()}-${Date.now()}.png`;
    console.log(req.file);
    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat("png")
            .png({ quality: 90 })
            .toFile(`uploads/brands/${filename}`);
        // Save image into db
        req.body.image = filename;
    }
    next();
});

/**
 *  @description Get list of brands
 *  @route       GET /api/v1/brands
 *  @access      Public
 */
exports.getBrands = factory.getAll(Brand);

/**
 *  @description Get brand
 *  @route       GET /api/v1/brands/:id
 *  @access      Public
 */
exports.getBrand = factory.getOne(Brand);

/**
 *  @description Create brand
 *  @route       POST /api/v1/brand
 *  @access      Private/Admin-Manager
 */
exports.createBrand = factory.createOne(Brand);

/**
 *  @description Update brand
 *  @route       POST /api/v1/brand/:id
 *  @access      Private/Admin-Manager
 */
exports.updateBrand = factory.updateOne(Brand);

/**
 *  @description Delete brand
 *  @route       DELETE /api/brnad/:id
 *  @access      Private/Admin
 */
exports.deleteBrand = factory.deleteOne(Brand);
