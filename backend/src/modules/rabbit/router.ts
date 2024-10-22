import { Router } from "express";
import { addToTestQueue } from "./controllers";

const router = Router();

router.post("/addToTestQueue", addToTestQueue);

export default router;
