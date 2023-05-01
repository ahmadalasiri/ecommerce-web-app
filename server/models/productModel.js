const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "Too short product title"],
            maxlength: [100, "Too long product title"],
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            minlength: [20, "Too short porduct description"],
        },
        quantity: {
            type: Number,
            required: [true, "Product quantity is required"],
        },
        sold: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "Product price is rquired"],
            trim: true,
            max: [2000000, "Too long product price"],
        },
        priceAfterDiscount: {
            type: Number,
        },
        colors: [String],

        imageCover: {
            type: String,
            // required: [true, "Product Image cover is required"],
        },
        image: [String],

        category: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            required: [true, "Product must belong to main category"],
        },
        subcategories: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "SubCategory",
            },
        ],
        brand: {
            type: mongoose.Schema.ObjectId,
            ref: "Brand",
        },
        ratingsAverage: {
            type: Number,
            min: [1, "Rating must be above or equal to 1.0"],
            max: [5, "Rating must be below or equal to 5.0"],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        // to enable virtual populate
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "product",
    localField: "_id",
});

// Mongoose query middleware
productSchema.pre(/^find/, function (next) {
    this.populate({
        path: "category",
        select: "name",
    });
    next();
});

const setImageUrl = (doc) => {
    if (doc.imageCover) {
        const imageUrl = `${process.env.BASE_URL}/products/-cover-${doc.imageCover}`;
        doc.imageCover = imageUrl;
    }

    if (doc.image) {
        const imageList = [];

        doc.image.forEach((img) => {
            const imageUrl = `${process.env.BASE_URL}/products/${img}`;
            imageList.push(imageUrl);
        });

        doc.image = imageList;
    }
};

// findOne, findAll, udate
productSchema.post("init", (doc) => {
    setImageUrl(doc);
});
// create
productSchema.post("save", (doc) => {
    setImageUrl(doc);
});

module.exports = mongoose.model("Product", productSchema);
