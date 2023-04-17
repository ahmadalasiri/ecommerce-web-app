const { default: mongoose } = require("mongoose");
const monggoose = require("mongoose");

const cartSchema = monggoose.Schema(
    {
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                },
                quantity: { type: Number, default: 1 },
                color: String,
                price: Number,
            },
        ],
        totalCartPrice: Number,
        totalCartPriceAfterDiscount: Number,
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
