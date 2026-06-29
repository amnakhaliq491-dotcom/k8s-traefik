import mongoose from "mongoose";
import { createRequire } from "module";


import { loadEnvFromSecret } from "./loadsecret.js";

await loadEnvFromSecret("APP_ENV");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Mongo error:", err));