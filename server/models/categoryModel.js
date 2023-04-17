const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            unique: [true, "Category must be unique"],
            trim: true,
            index: true,
            minlength: [3, "Category name is too short"],
            maxlength: [32, "Category name is too long"],
        },
        slug: {
            type: String,
            lowercase: true,
        },
        image: String,
    },
    { timestamps: true }
);

const setImageUrl = (doc) => {
    if (doc.image) {
        const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
        doc.image = imageUrl;
    }
};

// findOne, findAll, udate
categorySchema.post("init", (doc) => {
    setImageUrl(doc);
});
// create
categorySchema.post("save", (doc) => {
    setImageUrl(doc);
});

module.exports = mongoose.model("Category", categorySchema);
