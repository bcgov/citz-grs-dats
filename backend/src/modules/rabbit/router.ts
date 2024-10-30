import { Router } from "express";
import { health } from "./controllers";
import { add as addToTestQueue } from "./controllers/queue/test";

const router = Router();

router.get("/health", health);
router.post("/queue/test", addToTestQueue);

export default router;
