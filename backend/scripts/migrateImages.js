/**
 * Image Migration Script
 * 
 * This script updates all products with free Unsplash image URLs.
 * NO CLOUDINARY NEEDED - uses free stock images!
 * 
 * HOW TO USE:
 * 1. Make sure you have MONGO_URI in your .env file
 * 2. Run: node scripts/migrateImages.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

// Product Schema (simplified)
const productSchema = mongoose.Schema({
  name: String,
  image: String,
});
const Product = mongoose.model("Product", productSchema);

// FREE Unsplash images - permanent URLs, no signup needed
const FREE_IMAGES = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop",
];

async function migrateImages() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Skip if already has a valid Unsplash URL
      if (product.image && product.image.startsWith("https://images.unsplash.com")) {
        console.log(`⏭️  ${product.name} - Already has Unsplash image`);
        skipped++;
        continue;
      }

      // Assign a free Unsplash image
      const newImage = FREE_IMAGES[i % FREE_IMAGES.length];
      product.image = newImage;
      await product.save();
      console.log(`✅ ${product.name} - Updated with free image`);
      updated++;
    }

    console.log("\n" + "=".repeat(40));
    console.log("🎉 Migration complete!");
    console.log(`   Updated: ${updated} | Skipped: ${skipped}`);
    console.log("=".repeat(40));
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
