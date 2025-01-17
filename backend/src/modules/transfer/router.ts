import { Router } from "express";
import { create, lan } from "./controllers";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/", upload.single("file"), create);
router.post(
  "/lan",
  upload.fields([
    { name: "fileList", maxCount: 1 },
    { name: "transferForm", maxCount: 1 },
    { name: "contentZipBuffer", maxCount: 1 },
  ]),
  lan
);

export default router;
