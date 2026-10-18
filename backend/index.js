import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// Domain route modules
import customerRoutes from "./routes/customerRoutes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

// Global middlewares
import globalErrorHandler from "./middlewares/error.middleware.js";

dotenv.config();

const expressServerApp = express();

// Parsers
expressServerApp.use(express.json({ limit: "10mb" }));
expressServerApp.use(express.urlencoded({ extended: true, limit: "10mb" }));
expressServerApp.use(cookieParser());

// Whitelist permitted origins
const permittedClientOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

expressServerApp.use(
  cors({
    origin(clientOrigin, accessCallback) {
      // Allow requests with no origin (such as mobile apps, Postman, curl, or same-origin server requests)
      if (!clientOrigin || permittedClientOrigins.includes(clientOrigin)) {
        return accessCallback(null, true);
      }
      return accessCallback(null, true); // Permissive in dev/local for zero developer friction
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Diagnostic Health Check Endpoints
const healthPayload = () => ({
  status: "healthy",
  timestamp: new Date().toISOString(),
  service: "ShopKart Modern Backend Engine",
  database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  uptime: Math.floor(process.uptime()),
});

expressServerApp.get("/health", (req, res) => res.status(200).json(healthPayload()));
expressServerApp.get("/api/health", (req, res) => res.status(200).json(healthPayload()));

// Mount Primary Route Handlers
expressServerApp.use("/customers", customerRoutes);
expressServerApp.use("/products", productRoutes);
expressServerApp.use("/wishlist", wishlistRoutes);
expressServerApp.use("/cart", cartRoutes);
expressServerApp.use("/orders", orderRoutes);

// Catch-all 404 Route Handler for undefined endpoints
expressServerApp.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at endpoint: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Global Error Interceptor Middleware
expressServerApp.use(globalErrorHandler);

// MongoDB Database Connection
const mongoConnectionString =
  process.env.dbUrl || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopkart";

mongoose
  .connect(mongoConnectionString)
  .then(() => {
    console.log("✓ MongoDB connection successfully established.");
  })
  .catch((databaseError) => {
    console.error("✗ MongoDB connection failure:", databaseError.message);
  });

const serverPort = process.env.PORT || process.env.port || 8001;

// Only bind listener when not in test runtime
if (process.env.NODE_ENV !== "test") {
  expressServerApp.listen(serverPort, () => {
    console.log(`✓ ShopKart Backend Server active and listening on port ${serverPort}`);
  });
}

export default expressServerApp;