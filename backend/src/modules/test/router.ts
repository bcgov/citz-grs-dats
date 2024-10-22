import { Router } from "express";
import { addToRabbitQueue } from "./controllers";

const router = Router();

router.post("/addToQueue", addToRabbitQueue);

export default router;
