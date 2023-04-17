const mongoose = require("mongoose");

const brandSchema = mongoose.Schema(
    {
        name: {
            type: String,
            unique: [true, "brand must be unique"],
            require: [true, "brand name is required"],
            minlenght: [2, "brand name is too short"],
            maxlenght: [32, "brand name is too long"],
            trim: true,
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
        const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image = imageUrl;
    }
};
// findOne, findAll, update
brandSchema.post("init", (doc) => {
    setImageUrl(doc);
});
// create
brandSchema.post("save", (doc) => {
    setImageUrl(doc);
});

module.exports = mongoose.model("Brand", brandSchema);
