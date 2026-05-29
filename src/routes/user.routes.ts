import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getMe, completeProfile, register, checkUsername } from "../controllers/user.controller";

const router = Router();

router.get("/me", authenticate, getMe);
router.post("/complete-profile", authenticate, completeProfile);
router.post("/register", authenticate, register);
router.get("/check-username", checkUsername);

export default router;
