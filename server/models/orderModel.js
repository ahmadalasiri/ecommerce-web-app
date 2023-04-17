const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "Order must be belong to user"],
        },
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Product",
                },
                quantity: Number,
                color: String,
                price: Number,
            },
        ],
        taxPrice: {
            type: Number,
            default: 0,
        },
        shippingAddress: {
            details: String,
            phone: Number,
            city: String,
            postalCode: String,
        },
        shippingPrice: { type: Number, default: 0 },
        totalOrderPrice: Number,
        paymentMethodPrice: {
            type: String,
            enum: ["card", "cach"],
            default: "cach",
        },
        isPaid: { type: Boolean, default: false },
        paidAt: Date,
        deliveredAt: Date,
        isDelivered: { type: Boolean, default: false },
    },
    { timestamps: true }
);

orderSchema.pre(/^find/, function (next) {
    this.populate({ path: "user", select: "name email phone" }).populate({
        path: "cartItems.product",
        select: "title",
    });
    next();
});

module.exports = mongoose.model("Order", orderSchema);
