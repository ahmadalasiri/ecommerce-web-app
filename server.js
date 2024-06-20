const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
// const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


dotenv.config({ path: "config.env" });
const ApiError = require("./server/utils/apiError");
const globalError = require("./server/middleware/errorMiddleware");
const dbConnection = require("./server/database/dbConnection");

//  Routes
const mountRoutes = require("./server/routes");
const { webhookCheckout } = require("./server/controller/orderController");

// Connect to db
dbConnection();

// express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// Compress all responses
app.use(compression());

// for security
// app.use(helmet());

// checkout webhook
app.use(
    "/webhook-checkout",
    express.raw({ type: "application/json" }),
    webhookCheckout
);

// Middlewares
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message:
        "Too many accounts created from this IP, please try again after an hour",
});

// Apply the rate limiting middleware to API calls only
app.use("/api", limiter);

// Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});

// Handling error ouside express

process.on("SIGINT", () => {
    console.log("👋 SIGINT received. Shutting down gracefully...");
    server.close(() => {
        console.log("💥 Server closed.");
        process.exit(1);
    });
});

process.on("unhandledRejection", (err) => {
    console.log("#".repeat(33));
    console.error(`Unhandled Rejection Error: ${err.name} | ${err.message}`);
    server.close(() => {
        console.error("Shutting down....");
        process.exit(1);
    });
});
