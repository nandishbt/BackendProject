import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function savetoCloudinary(localFilepath) {
  //saveing local file to cloudinary
  try {
    const res = await cloudinary.uploader.upload(localFilepath, {
      resource_type: 'auto',
      public_id: 'videotube'
    });
    console.log(res.url);
    fs.unlinkSync(localFilepath); // Delete the local file after upload to Cloudinary
    return res;
  } catch (error) {
    console.error(`Error saving to Cloudinary: ${error.message}`);
    fs.unlinkSync(localFilepath); // Delete local file path if upload fails
    return null;
  }
}

// Optimize delivery by resizing and applying auto-format and auto-quality
//   const optimizeUrl = cloudinary.url("shoes", {
//     fetch_format: "auto",
//     quality: "auto",
//   });

//   console.log(optimizeUrl);

//   // Transform the image: auto-crop to square aspect_ratio
//   const autoCropUrl = cloudinary.url("shoes", {
//     crop: "auto",
//     gravity: "auto",
//     width: 500,
//     height: 500,
//   });

//   console.log(autoCropUrl);

export { savetoCloudinary };
