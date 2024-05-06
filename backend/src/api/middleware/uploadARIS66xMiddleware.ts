import multer from "multer";
import { Request, Response, NextFunction } from "express";

// Configure multer storage and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Upload66x/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Custom file upload middleware
export const uploadARIS66xMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use multer upload instance
  (upload.single("uploadARIS66xfile") as any)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Additional validation or processing if needed
    console.log("uploadARIS66xfile");

    // Proceed to the next middleware or route handler
    next();
  });
};
