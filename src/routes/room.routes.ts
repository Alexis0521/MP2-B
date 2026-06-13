import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
  createRoom,
  getMyRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller";

const router = Router();

router.post("/", authenticate, createRoom);

router.get("/", authenticate, getMyRooms);

router.get("/:roomId", authenticate, getRoomById);

router.put("/:roomId", authenticate, updateRoom);

router.delete("/:roomId", authenticate, deleteRoom);

export default router;