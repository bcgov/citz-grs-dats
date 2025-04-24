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
import { encodeKeysBase64AsObject } from "@/utils";

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
      const metadataV2 = JSON.parse(req.body.metadataV2 || "{}");
      let extendedMetadata = JSON.parse(req.body.extendedMetadata || "{}");
      const changes = JSON.parse(req.body.changes || "[]");

      metadataV2.folders = encodeKeysBase64AsObject(metadataV2.folders);
      metadataV2.files = encodeKeysBase64AsObject(metadataV2.files);
      extendedMetadata = encodeKeysBase64AsObject(extendedMetadata);

      req.body.metadataV2 = metadataV2;
      req.body.extendedMetadata = extendedMetadata;
      req.body.changes = changes;
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
      const metadata = JSON.parse(req.body.metadata || "{}");
      let extendedMetadata = JSON.parse(req.body.extendedMetadata || "{}");

      metadata.folders = encodeKeysBase64AsObject(metadata.folders);
      metadata.files = encodeKeysBase64AsObject(metadata.files);
      extendedMetadata = encodeKeysBase64AsObject(extendedMetadata);

      req.body.metadata = metadata;
      req.body.extendedMetadata = extendedMetadata;
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
