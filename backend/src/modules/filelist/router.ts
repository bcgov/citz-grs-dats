import { Router } from "express";
import { create } from "./controllers";

const router = Router();

router.post("/", create);

export default router;
