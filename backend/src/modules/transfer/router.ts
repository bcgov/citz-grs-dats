import { Router } from "express";
import { create, lan } from "./controllers";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/", upload.single("file"), create);
router.post(
  "/lan",
  upload.fields([
    { name: "fileListBuffer", maxCount: 1 },
    { name: "transferFormBuffer", maxCount: 1 },
    { name: "folderBuffers" },
  ]),
  lan
);

export default router;
