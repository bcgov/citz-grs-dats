import { Router } from "express";
import {
	login,
	loginCallback,
	logout,
	logoutCallback,
	token,
} from "./controllers";

const router = Router();

router.get("/login", login);
router.get("/login/callback", loginCallback);
router.get("/logout", logout);
router.get("/logout/callback", logoutCallback);
router.get("/token", token);

export default router;
