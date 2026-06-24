import express from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import "./db.js";
import { ProductModel } from "./product-model.js";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve images statically

const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

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

    res.json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

app.get("/", (req, res) => {
  res.json({ 
    message: "Backend API is running",
   
  });
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

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});