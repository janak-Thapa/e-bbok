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

const updateBook = async (req: Request, res: Response, next: NextFunction)=>{
    const {title,genre} = req.body;
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({_id:bookId})
   
    if(!book){
        return next(createHttpError(404,"Book not Found"))
        

    }
    const _req = req as AuthRequest;
    if(book.author.toString() !== _req.userId){
        return next(createHttpError(403,"You cannot update others Book."))


    }
    const files = req.files as {[filename:string]:Express.Multer.File[]};
    let completeCoverImage = "";
    if(files.coverImage){
        const filename = files.coverImage[0].filename
        const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);

        const filePath = path.resolve(__dirname,
            "../../public/data/uploads" + filename
        )

        completeCoverImage = filename;
        const uploadResult = await cloudinary.uploader.upload(filePath,{
            filename_override:completeCoverImage,
            folder:"book-covers",
            format:converMimeType,

        })

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    let completeFileName = "";
    if(files.file){
        const bookFilePath = path.resolve(__dirname,
            "../../public/data/uploads" + files.file[0].filename

        )

        const bookFileName = files.file[0].filename;
        completeFileName = bookFileName;

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath,{
            resource_type:"raw",
            filename_override:completeFileName,
            folder:"book-covers",
            format:"pdf",
        })
        completeFileName = uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath);
    }

    const updatedBook = await bookModel.findOneAndUpdate({
        _id:bookId,
    },
    {
        title:title,
        genre:genre,
        coverImage:completeCoverImage ? completeCoverImage :book.coverImage,
        file:completeFileName ? completeFileName :book.file,
    },
    {new:true}
    )
    res.json(updatedBook)
}

export { createBook, updateBook };

