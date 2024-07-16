import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Set up multer storage and file handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


export const uploadFolderDetails = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Use multer upload instance
    (upload.single("file") as any)(req, res, (err: any) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        // Additional validation or processing if needed
        console.log("Folder Detais");

        // Proceed to the next middleware or route handler
        next();
    });
};