import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { loadEnvFromSecret } = require("./loadsecret.js");

await loadEnvFromSecret("APP_ENV");

import express from "express";
import { v4 as uuidv4 } from "uuid";
import "./db.js";
import { ProductModel } from "./product-model.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) =>
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files allowed"));
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    
  });
});

app.post("/api/products/upload", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body || {};
    const file = req.file;

    if (!name || !description || !price || !file) {
      return res.status(400).json({
        message: "name, description, price, image are required",
      });
    }

    const product = await ProductModel.create({
      name,
      description,
      price,
      filename: file.filename,
    });

    res.json({ message: "Product created successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

app.get("/api/allproducts", async (req, res) => {
  try {
    const products = await ProductModel.find();
    const result = products.map((product) => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: `${req.protocol}://${req.get("host")}/uploads/${product.filename}`,
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});