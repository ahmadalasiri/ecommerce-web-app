const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name required"],
            trim: true,
        },
        slug: {
            type: String,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, "email required"],
            unique: [true, "email must be unique"],
            lowercase: true,
        },
        phone: String,
        profileImg: String,
        password: {
            type: String,
            required: [true, "password required"],
            minlength: [6, "Too short password"],
        },
        passwordChangedAt: Date,
        passwordResetCode: String,
        passwordResetCodeExpires: Date,
        passwordResetVerified: Boolean,
        role: {
            type: String,
            enum: ["user", "manager", "admin"],
            default: "user",
        },
        active: {
            type: Boolean,
            default: true,
        },
        // child reference (on to many)
        wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
        addresses: [
            {
                id: { type: mongoose.Schema.Types.ObjectId },
                alias: String,
                details: String,
                phone: String,
                city: String,
                postalCode: String,
            },
        ],
    },
    { timestamps: true }
);

const setImageUrl = (doc) => {
    if (doc.profileImg) {
        const profileImgUrl = `${process.env.BASE_URL}/users/${doc.profileImg}`;
        doc.profileImg = profileImgUrl;
    }
};
// findOne, findAll, update
userSchema.post("init", (doc) => {
    setImageUrl(doc);
});
// create
userSchema.post("save", (doc) => {
    setImageUrl(doc);
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 5);
    next();
});

module.exports = mongoose.model("User", userSchema);
