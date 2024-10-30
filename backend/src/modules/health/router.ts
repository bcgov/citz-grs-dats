import { Router } from "express";
import { services } from "./controllers";

const router = Router();

router.get("/services", services);

export default router;
