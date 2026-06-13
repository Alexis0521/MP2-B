import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createRoom, getMyRooms } from "../controllers/room.controller";

const router = Router();

router.post("/", authenticate, createRoom);
router.get("/", authenticate, getMyRooms);

export default router;