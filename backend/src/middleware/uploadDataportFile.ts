import multer from "multer";
import { Request, Response, NextFunction } from "express";
import createFolder from "../utils/createFolder";

var folderPath = process.env.UPLOAD_ARIS66X_FOLDER || "Upload66x/";
createFolder(folderPath);
// Configure multer storage and file name
const storage = multer.memoryStorage();

// Create multer upload instance
const upload = multer({ storage: storage });

// Custom file upload middleware
export const uploadDataportFileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use multer upload instance
  (upload.any() as any)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Additional validation or processing if needed
    console.log("uploadDataportFile");

    // Proceed to the next middleware or route handler
    next();
  });
};
