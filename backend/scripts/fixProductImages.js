/**
 * Fix Product Images Script
 * 
 * This script updates ALL products in your database with free Unsplash images.
 * No Cloudinary needed - just run this script once!
 * 
 * USAGE:
 * 1. Make sure you have MONGO_URI in your .env file
 * 2. Run: node scripts/fixProductImages.js
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
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});
const Product = mongoose.model("Product", productSchema);

// Category Schema
const categorySchema = mongoose.Schema({ name: String });
const Category = mongoose.model("Category", categorySchema);

// FREE STOCK IMAGES - No signup required, these are permanent URLs
const PRODUCT_IMAGES = {
  // Electronics
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop", // Headphones
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop", // Watch
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop", // Camera
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop", // Phone
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop", // Headphones 2
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop", // Headphones 3
    "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&h=500&fit=crop", // Headphones 4
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop", // Speaker
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop", // Earbuds
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop", // Laptop
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop", // Tablet
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop", // Phone 2
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop", // Camera 2
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop", // Gaming laptop
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=500&fit=crop", // Chromebook
  ],
  
  // Clothing
  clothing: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop", // Sneakers red
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop", // Sneakers yellow
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop", // Leather jacket
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop", // Jacket
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop", // Denim jacket
    "https://images.unsplash.com/photo-1544923246-77307dd628b9?w=500&h=500&fit=crop", // Puffer jacket
    "https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=500&h=500&fit=crop", // Hiking boots
    "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=500&h=500&fit=crop", // Formal shoes
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop", // Shoes
    "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&h=500&fit=crop", // Polo shirt
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop", // Dress shirt
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop", // T-shirt
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=500&fit=crop", // Clothing
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&h=500&fit=crop", // T-shirts
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&h=500&fit=crop", // Clothes rack
  ],
  
  // Home & Garden
  home: [
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop", // Lamp
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop", // Plants
    "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&h=500&fit=crop", // Knife set
    "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop", // Coffee maker
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=500&fit=crop", // Bedroom
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop", // Air purifier
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop", // Kitchen
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&h=500&fit=crop", // Living room
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop", // Sofa
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500&h=500&fit=crop", // Couch
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=500&fit=crop", // Furniture
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=500&h=500&fit=crop", // Home decor
    "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=500&h=500&fit=crop", // Kitchen tools
  ],
  
  // Sports & Outdoors
  sports: [
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop", // Yoga mat
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=500&fit=crop", // Dumbbells
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop", // Gym
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=500&fit=crop", // Gym equipment
    "https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=500&h=500&fit=crop", // Bicycle
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&h=500&fit=crop", // Running
    "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=500&h=500&fit=crop", // Basketball
    "https://images.unsplash.com/photo-1461896836934- voices?w=500&h=500&fit=crop", // Football
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&h=500&fit=crop", // Soccer
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&h=500&fit=crop", // Kettlebell
  ],
  
  // Books & Stationery
  books: [
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop", // Books
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&h=500&fit=crop", // Library
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop", // Book
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&h=500&fit=crop", // Books stack
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&h=500&fit=crop", // Notebook
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop", // Pen
    "https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=500&fit=crop", // Stationery
  ],
  
  // Default/fallback images
  default: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop",
  ],
};

// Get category name to determine image set
function getCategoryType(categoryName) {
  const name = (categoryName || "").toLowerCase();
  if (name.includes("electronic") || name.includes("tech") || name.includes("gadget")) return "electronics";
  if (name.includes("cloth") || name.includes("fashion") || name.includes("wear") || name.includes("shoe") || name.includes("apparel")) return "clothing";
  if (name.includes("home") || name.includes("garden") || name.includes("kitchen") || name.includes("furniture")) return "home";
  if (name.includes("sport") || name.includes("outdoor") || name.includes("fitness") || name.includes("gym")) return "sports";
  if (name.includes("book") || name.includes("station") || name.includes("office")) return "books";
  return "default";
}

// Get a random image from the appropriate category
function getRandomImage(categoryType, index) {
  const images = PRODUCT_IMAGES[categoryType] || PRODUCT_IMAGES.default;
  return images[index % images.length];
}

async function fixProductImages() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all categories first
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });
    console.log(`📁 Found ${categories.length} categories\n`);

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update\n`);

    if (products.length === 0) {
      console.log("⚠️  No products found. Run the seeder first:");
      console.log("   node seeder.js");
      process.exit(0);
    }

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Skip if already has a valid HTTP URL
      if (product.image && product.image.startsWith("https://images.unsplash.com")) {
        console.log(`⏭️  Skipping "${product.name}" - Already has Unsplash image`);
        skipped++;
        continue;
      }

      // Determine category type and get appropriate image
      const categoryName = categoryMap[product.category?.toString()] || "";
      const categoryType = getCategoryType(categoryName);
      const newImage = getRandomImage(categoryType, i);

      // Update the product
      product.image = newImage;
      await product.save();
      
      console.log(`✅ Updated "${product.name}" → ${categoryType} image`);
      updated++;
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 DONE!");
    console.log(`   ✅ Updated: ${updated} products`);
    console.log(`   ⏭️  Skipped: ${skipped} products (already had valid images)`);
    console.log("=".repeat(50));
    console.log("\n📝 Next steps:");
    console.log("   1. Commit and push your changes");
    console.log("   2. Redeploy to Vercel");
    console.log("   3. Your images will now work! 🎊\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixProductImages();
