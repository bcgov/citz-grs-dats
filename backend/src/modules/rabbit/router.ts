import { Router } from "express";
import { addToTestQueue, health } from "./controllers";

const router = Router();

router.get("/health", health);
router.post("/addToTestQueue", addToTestQueue);

export default router;
