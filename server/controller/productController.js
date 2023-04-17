const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

const { uploadMixOfFiles } = require("../middleware/uploadImageMiddleware");
const Product = require("../models/productModel");
const factory = require("./handlersFactory");

exports.uploadProductImages = uploadMixOfFiles([
    { name: "imageCover", maxCount: 1 },
    { name: "image", maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
    if (req.files.imageCover) {
        const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-covre.png`;
        if (req.file) {
            await sharp(req.files.imageCover[0].buffer)
                .resize(2000, 1333)
                .toFormat("png")
                .png({ quality: 95 })
                .toFile(`uploads/products/${imageCoverFileName}`);
            // save image into db
            req.body.imageCover = imageCoverFileName;
        }
        if (req.files.image) {
            req.body.image = [];
            await Promise.all(
                req.files.image.map((img, index) => {
                    const imageName = `product-${uuidv4()}-${Date.now()}-${
                        index + 1
                    }.png`;
                    sharp(img.buffer)
                        .resize(2000, 1333)
                        .toFormat("png")
                        .png({ quality: 90 })
                        .toFile(`uploads/products/${imageName}`);

                    // save image into db
                    req.body.image.push(imageName);
                })
            );
        }
    }
    next();
});

/**
 *  @description Get list of products
 *  @route       GET /api/v1/products
 *  @access      Public
 */
exports.getProducts = factory.getAll(Product, "Products");
/**
 *  @description Get product
 *  @route       GET /api/v1/products/:id
 *  @access      Public
 */
exports.getProduct = factory.getOne(Product, "reviews");

/**
 *  @description Create product
 *  @route       POST /api/v1/products
 *  @access      Private
 */
exports.createProduct = factory.createOne(Product);
/**
 *  @description Update product
 *  @route       PUT /api/products/:id
 *  @access      Private
 */
exports.updateProduct = factory.updateOne(Product);

/**
 *  @description Delete product
 *  @route       DELETE /api/products/:id
 *  @access      Private
 */
exports.deleteProduct = factory.deleteOne(Product);
