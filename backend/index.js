import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Optimized mongoose connection options:
// - maxPoolSize: keeps up to 10 concurrent connections ready (default is 5)
// - serverSelectionTimeoutMS: fails fast if DB is unreachable (5s instead of 30s default)
// - socketTimeoutMS: closes idle sockets after 45s to free resources
mongoose
  .connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("DB Connected successfully."))
  .catch((err) => console.error("Failed to connect to DB:", err));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to TaskNest API" });
});

app.use("/api-v1", routes);

// ✅ 404 handler — must come before error handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});