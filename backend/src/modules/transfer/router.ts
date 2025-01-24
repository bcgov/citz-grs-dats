import type { Request, Response, NextFunction, RequestHandler } from "express";
import { Router } from "express";
import { create, lan } from "./controllers";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/", upload.single("file"), create);

const asyncMiddleware =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// The second middleware is used to convert the stringified objects in the request body
// into JSON objects.
router.post(
  "/lan",
  asyncMiddleware((req: Request, res: Response, next: NextFunction) => {
    upload.any()(req, res, (err: unknown) => {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(500)
          .json({
            message: "File upload error",
            error: err instanceof Error ? err.message : err,
          });
      }

      try {
        console.log("Debug 1");
        req.body.originalFoldersMetadata = JSON.parse(
          req.body.originalFoldersMetadata || "{}"
        );
        req.body.metadataV2 = JSON.parse(req.body.metadataV2 || "{}");
        req.body.changes = JSON.parse(req.body.changes || "[]");
        next();
      } catch (error) {
        return res
          .status(400)
          .json({ message: "Invalid JSON format in request body" });
      }
    });
  }),
  lan
);

export default router;
