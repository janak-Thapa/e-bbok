import { config as conf } from "dotenv"
import cloudinary from "./cloudinary";
conf();
const _config = {
  port:process.env.PORT,
  databaseUrl:process.env.MONGO_CONNECTION_STRING,
  env:process.env.NODE_ENV,
  jwtSecret:process.env.JWT_SECRET_KEY,
  cloudinaryCloud:process.env.CLOUDINARY_CLOUD,
  cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
  cloudinarySecret:process.env.CLOUDINARY_API_SECRET,
  
}

export const config = Object.freeze(_config)