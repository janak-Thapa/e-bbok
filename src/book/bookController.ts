import path from "node:path";
import fs from "node:fs";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split('/').at(-1);
    const coverImageFileName = files.coverImage[0].filename;
    const coverImagePath = path.resolve(__dirname, '../../public/data/uploads', coverImageFileName);

    const bookFileName = files.file[0].filename; // Correct variable name
    const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName);

    try {
        // Upload cover image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(coverImagePath, {
            filename_override: coverImageFileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        // Upload book file to Cloudinary
        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf",
        });

        
            
        const _req = req as AuthRequest;
        // Create new book entry in the database
        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookFileUploadResult.secure_url,
        });

        // Delete local files after upload
        await fs.promises.unlink(coverImagePath);
        await fs.promises.unlink(bookFilePath);

        res.status(201).json({ id: newBook._id });
    } catch (err) {
        console.error(err); // Improved error logging
        return next(createHttpError(500, "Error while uploading files"));
    }
};

export { createBook };

