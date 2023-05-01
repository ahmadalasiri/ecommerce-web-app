const mongoose = require("mongoose");

const subCategorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "SubCategory name is required"],
            unique: [true, "SubCategory must be unique"],
            trim: true,
            minlength: [2, "SubCategory name is too short"],
            maxlength: [32, "SubCategory name is too long"],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        mainCategory: {
            type: mongoose.Schema.ObjectId,
            ref: "Category",
            require: [true, "SubCategory must belong to main category"],
        },
    },
    { timestamps: true }
);

subCategorySchema.pre(/^find/, function (next) {
    this.populate({ path: "mainCategory", select: "name" });
    next();
});

module.exports = mongoose.model("SubCategory", subCategorySchema);
