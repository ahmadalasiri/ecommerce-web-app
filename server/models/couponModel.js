const mongoose = require("mongoose");

const couponSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            reqiured: [true, "Coupon name required"],
            unique: true,
        },
        expire: {
            type: Date,
            reqiured: [true, "Coupon expire date required"],
        },
        discount: {
            type: Number,
            required: [true, "Coupon discount required"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
