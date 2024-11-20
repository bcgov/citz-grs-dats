import { Router } from "express";
import { create, test } from "./controllers";

const router = Router();

router.post("/", create);
router.post("/test", test);

export default router;
