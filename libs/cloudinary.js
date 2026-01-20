import { v2 as cloudinary } from "cloudinary";

// Check if environment variables are available
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    !process.env.CLOUDINARY_API_KEY || 
    !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Cloudinary environment variables are not set properly");
  console.warn("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not Set");
  console.warn("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "Set" : "Not Set");
  console.warn("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "Set" : "Not Set");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;