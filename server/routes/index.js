// Routes
const categoryRouter = require("./categoryRoute");
const subCategoryRouter = require("./subCategoryRoute");
const brandRouter = require("./brandRoute");
const productRouter = require("./productRoute");
const reviewRouter = require("./reviewRoute");
const userRouter = require("./userRoute");
const authRouter = require("./authRoute");
const wishlistRoute = require("./wishlistRoute");
const addressRoute = require("./addressRoute");
const couponRoute = require("./couponRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute");

const mountRoutes = (app) => {
    app.use("/api/v1/categories", categoryRouter);
    app.use("/api/v1/subCategories", subCategoryRouter);
    app.use("/api/v1/brands", brandRouter);
    app.use("/api/v1/products", productRouter);
    app.use("/api/v1/reviews", reviewRouter);
    app.use("/api/v1/users", userRouter);
    app.use("/api/v1/auth", authRouter);
    app.use("/api/v1/wishlist", wishlistRoute);
    app.use("/api/v1/addresses", addressRoute);
    app.use("/api/v1/coupons", couponRoute);
    app.use("/api/v1/cart", cartRoute);
    app.use("/api/v1/orders", orderRoute);
};

module.exports = mountRoutes;
