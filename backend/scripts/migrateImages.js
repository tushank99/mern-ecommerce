/**
 * Image Migration Script
 * 
 * This script helps migrate local image paths to Cloudinary URLs.
 * 
 * HOW TO USE:
 * 1. First, set your Cloudinary credentials as environment variables
 * 2. Run: node scripts/migrateImages.js
 * 
 * Or you can manually update products in MongoDB Atlas to use placeholder images
 * or re-upload images through the admin panel after deployment.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// Product Schema (simplified)
const productSchema = mongoose.Schema({
  name: String,
  image: String,
});
const Product = mongoose.model("Product", productSchema);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Placeholder image URL (use this if you don't have local images)
const PLACEHOLDER_IMAGE = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

async function migrateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      // Skip if already a Cloudinary URL or external URL
      if (product.image && (product.image.includes("cloudinary") || product.image.startsWith("http"))) {
        console.log(`✓ ${product.name} - Already using external URL`);
        continue;
      }

      // Check if local file exists
      const localPath = path.join(__dirname, "../..", product.image);
      
      if (fs.existsSync(localPath)) {
        // Upload to Cloudinary
        try {
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "ecommerce-products",
          });
          product.image = result.secure_url;
          await product.save();
          console.log(`✓ ${product.name} - Uploaded to Cloudinary`);
        } catch (uploadError) {
          console.log(`✗ ${product.name} - Upload failed, using placeholder`);
          product.image = PLACEHOLDER_IMAGE;
          await product.save();
        }
      } else {
        // Use placeholder
        console.log(`✗ ${product.name} - Local file not found, using placeholder`);
        product.image = PLACEHOLDER_IMAGE;
        await product.save();
      }
    }

    console.log("\nMigration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
