// src/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: './.env' }); // explicit path to avoid ambiguity

import authRoutes from "./routes/authRoutes.js";
import postsRoutes from "./routes/posts.js";
import path from 'path';
import fs from 'fs';
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser()); // parse cookies before routes that may read them
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), // allow all origins while preserving non-"*" for credentials
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options('*', cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

app.use("/auth", authRoutes);
// Ensure uploads directory exists and serve static files
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/posts', postsRoutes);

// DEBUG: show what Node sees
console.log("Working directory:", process.cwd());
console.log("Loaded .env? MONGO_URI =", process.env.MONGO_URI);

// fallback: if env var missing, use a sensible local default for development
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-linkedin';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected to:", MONGO_URI);
    app.listen(5001, () => console.log("Auth Service running on 5001"));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
