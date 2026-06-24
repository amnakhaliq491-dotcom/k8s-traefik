import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  filename: String,
});

export const ProductModel = mongoose.model(
  "Product",
  productSchema
);