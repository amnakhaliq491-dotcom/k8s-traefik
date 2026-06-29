import mongoose from "mongoose";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnvFromSecret } = require("./loadsecret.js");

await loadEnvFromSecret("APP_ENV");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("Mongo error:", err));