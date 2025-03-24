import { Router } from "express";
import { get, create } from "./controllers";
import { decline } from "./controllers/decline";

const router = Router();

router.get("/", get);
router.post("/", create);
router.post("/decline", decline);

export default router;
