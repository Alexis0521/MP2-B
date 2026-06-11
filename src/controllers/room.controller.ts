import { Response } from "express";
import { db } from "../config/firebase";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { createRoomSchema } from "../schemas/room.schema";

export const createRoom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const uid = req.uid!;

  const parseResult = createRoomSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: parseResult.error.issues,
    });
    return;
  }

  const { name } = parseResult.data;

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).json({
        message: "Usuario no encontrado",
      });
      return;
    }

    const userData = userDoc.data()!;

    const roomRef = db.collection("rooms").doc();

    await roomRef.set({
      id: roomRef.id,
      name,
      adminUid: uid,
      adminUsername: userData.username,
      membersCount: 1,
      active: true,
      createdAt: new Date(),
    });

    res.status(201).json({
      roomId: roomRef.id,
      message: "Sala creada exitosamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const getMyRooms = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const uid = req.uid!;

  try {
    const snapshot = await db
      .collection("rooms")
      .where("adminUid", "==", uid)
      .where("active", "==", true)
      .get();

    const rooms = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      membersCount: doc.data().membersCount,
      adminUsername: doc.data().adminUsername,
    }));

    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};