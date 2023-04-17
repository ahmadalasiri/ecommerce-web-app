const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");

const { uploadSingleFile } = require("../middleware/uploadImageMiddleware");
const Category = require("../models/categoryModel");

// Upload single image
exports.uploadCategoryImage = uploadSingleFile("image");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.png`;
    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat("png")
            .png({ quality: 90 })
            .toFile(`uploads/categories/${filename}`);
        // Save image into db
        req.body.image = filename;
    }
    next();
});
/**
 *  @description Get list of categories
 *  @route       GET /api/v1/catetgories
 *  @access      Public
 */
exports.getCategories = factory.getAll(Category);

/**
 *  @description Get category
 *  @route       GET /api/categories/:id
 *  @access      Public
 */
exports.getCategory = factory.getOne(Category);

/**
 *  @description Create category
 *  @route       POST /api/v1/categories
 *  @access      Private/Admin-Manager
 */
exports.createCategory = factory.createOne(Category);

/**
 *  @description Update category
 *  @route       PUT /api/category/:id
 *  @access      Private/Admin-Manager
 */
exports.updateCategory = factory.updateOne(Category);

/**
 *  @description Delete category
 *  @route       DELETE /api/categories/:id
 *  @access      Private/Admin
 */
exports.deleteCategory = factory.deleteOne(Category);
