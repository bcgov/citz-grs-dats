import { Router } from "express";
import { health } from "./controllers";

const router = Router();

router.post("/health", health);

export default router;
