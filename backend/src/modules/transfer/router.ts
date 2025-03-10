import type { Request, Response, NextFunction, RequestHandler } from "express";
import { Router } from "express";
import {
  create,
  download,
  edrms,
  lan,
  remove,
  view,
  preserve,
} from "./controllers";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5 GB
    fieldSize: 5 * 1024 * 1024 * 1024, // 5 GB per field
  },
});

const router = Router();

// Get completed transfers
router.get("/", view);

// Get download link for transfer.
router.post("/download", download);

// Preserve to LibSafe.
router.post("/preserve", preserve);

// Remove transfer.
router.delete("/", remove);

// Create standard transfer.
router.post("/", upload.single("file"), create);

// The second middleware is used to convert the stringified objects in the request body
// into JSON objects.
router.post(
  "/lan",
  upload.any(),
  ((req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.originalFoldersMetadata = JSON.parse(
        req.body.originalFoldersMetadata || "{}"
      );
      req.body.metadataV2 = JSON.parse(req.body.metadataV2 || "{}");
      req.body.extendedMetadata = JSON.parse(req.body.extendedMetadata || "{}");
      req.body.changes = JSON.parse(req.body.changes || "[]");
      next();
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid JSON format in request body" });
    }
  }) as RequestHandler,
  lan
);

// The second middleware is used to convert the stringified objects in the request body
// into JSON objects.
router.post(
  "/edrms",
  upload.any(),
  ((req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.metadata = JSON.parse(req.body.metadata || "{}");
      req.body.extendedMetadata = JSON.parse(req.body.extendedMetadata || "{}");
      next();
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid JSON format in request body" });
    }
  }) as RequestHandler,
  edrms
);

export default router;
