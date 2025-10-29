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
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true), 
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



const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
app.use('/posts', postsRoutes);



const MONGO_URI = process.env.MONGO_URI 

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
