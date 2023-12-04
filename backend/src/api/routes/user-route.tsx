/**
 * @summary This is the User Endpoint for DATS
 * @author Jlevesqu
 */
import express from "express";
import { getUserByGuid, getUsers } from "../controller/user-controller";

const router = express.Router();

// User from single guid
router.route("/user/guid").get(getUserByGuid);

// Get all users
router.route("/user").get(getUsers);

export default router;
