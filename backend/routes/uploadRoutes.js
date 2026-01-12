import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Local storage (works for development)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

// Create upload middleware - only use Cloudinary if configured
let uploadMiddleware = null;

const getUploadMiddleware = async () => {
  if (uploadMiddleware) return uploadMiddleware;
  
  if (isCloudinaryConfigured()) {
    try {
      // Dynamic import to avoid crash when Cloudinary isn't configured
      const cloudinaryModule = await import("cloudinary");
      const cloudinaryStorageModule = await import("multer-storage-cloudinary");
      
      const cloudinary = cloudinaryModule.v2;
      const CloudinaryStorage = cloudinaryStorageModule.CloudinaryStorage;
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const cloudinaryStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
          folder: "ecommerce-products",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          transformation: [{ width: 800, height: 800, crop: "limit" }],
        },
      });

      uploadMiddleware = multer({ storage: cloudinaryStorage, fileFilter });
      console.log("Using Cloudinary for uploads");
    } catch (error) {
      console.log("Cloudinary not available, using local storage:", error.message);
      uploadMiddleware = multer({ storage: localStorage, fileFilter });
    }
  } else {
    uploadMiddleware = multer({ storage: localStorage, fileFilter });
    console.log("Using local storage for uploads");
  }
  
  return uploadMiddleware;
};

router.post("/", async (req, res) => {
  try {
    const upload = await getUploadMiddleware();
    const uploadSingleImage = upload.single("image");

    uploadSingleImage(req, res, (err) => {
      if (err) {
        res.status(400).send({ message: err.message });
      } else if (req.file) {
        // Cloudinary returns path in req.file.path as full URL
        // Local storage returns relative path
        const imageUrl = isCloudinaryConfigured()
          ? req.file.path
          : `/${req.file.path}`;
        
        res.status(200).send({
          message: "Image uploaded successfully",
          image: imageUrl,
        });
      } else {
        res.status(400).send({ message: "No image file provided" });
      }
    });
  } catch (error) {
    res.status(500).send({ message: "Upload initialization failed" });
  }
});

export default router;
