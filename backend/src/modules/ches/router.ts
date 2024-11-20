import { Router } from "express";
import { health, emailTest } from "./controllers";

const router = Router();

router.get("/health", health);
router.post("/email/test", emailTest);

export default router;
