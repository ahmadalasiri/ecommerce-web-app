const mongoose = require("mongoose");

const Product = require("./productModel");

const reviewSchema = mongoose.Schema(
    {
        title: {
            type: String,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, "Review rating required"],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Review must belong to user"],
        },
        // Parent reference (one to many)
        product: {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: [true, "Review must belong ot product"],
        },
    },
    { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: "user", select: "name" });
    next();
});

reviewSchema.statics.calcAverageRatnigAndQuantity = async function (productId) {
    const result = await this.aggregate([
        // Stage 1: get all reviews in porduct
        {
            $match: {
                product: productId,
            },
        },
        // Stage 2: Grouping reviews based on productId and calc avgRating, ratingQuantity
        {
            $group: {
                _id: "product",
                avgRatings: {
                    $avg: `$rating`,
                },
                ratingsQuantity: { $sum: 1 },
            },
        },
    ]);
    if (result.length > 0) {
        await Product.findByIdAndUpdate(
            productId,
            {
                ratingsAverage: result[0].avgRatings,
                ratingsQuantity: result[0].ratingsQuantity,
            },
            { new: true }
        );
    } else {
        await Product.findByIdAndUpdate(productId, {
            ratingsAverage: 0,
            ratingsQuantity: 0,
        });
    }
};

reviewSchema.post("save", async function () {
    await this.constructor.calcAverageRatnigAndQuantity(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);
