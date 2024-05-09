import multer from "multer";
import { Request, Response, NextFunction } from "express";
import createFolder from "../utils/createFolder";

var folderPath = process.env.UPLOAD_ARIS617_FOLDER || "Upload617/";
createFolder(folderPath);

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Custom file upload middleware
export const uploadARIS617Middleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use multer upload instance
  (upload.single("uploadARIS617file") as any)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Additional validation or processing if needed
    console.log("uploadARIS617file");

    // Proceed to the next middleware or route handler
    next();
  });
};
