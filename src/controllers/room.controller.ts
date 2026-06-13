import { Response } from "express";
import { db } from "../config/firebase";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createRoomSchema,
  updateRoomSchema,
} from "../schemas/room.schema";

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

export const getRoomById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const roomId =
    Array.isArray(req.params.roomId)
      ? req.params.roomId[0]
      : req.params.roomId;

  if (!roomId) {
    res.status(400).json({
      message: "ID de sala inválido",
    });
    return;
  }

  try {
    const roomDoc = await db
      .collection("rooms")
      .doc(roomId)
      .get();

    if (!roomDoc.exists) {
      res.status(404).json({
        message: "Sala no encontrada",
      });
      return;
    }

    const room = roomDoc.data();

    if (!room?.active) {
      res.status(404).json({
        message: "Sala no encontrada",
      });
      return;
    }

    res.status(200).json(room);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const updateRoom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const uid = req.uid!;
  const roomId = String(req.params.roomId);

if (!roomId) {
  res.status(400).json({
    message: "ID de sala inválido",
  });
  return;
}

  const parseResult =
    updateRoomSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: parseResult.error.issues,
    });
    return;
  }

  try {
    const roomRef =
      db.collection("rooms").doc(roomId);

    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      res.status(404).json({
        message: "Sala no encontrada",
      });
      return;
    }

    const roomData = roomDoc.data()!;

    if (roomData.adminUid !== uid) {
      res.status(403).json({
        message:
          "Solo el anfitrión puede editar esta sala",
      });
      return;
    }

    await roomRef.update({
      name: parseResult.data.name,
    });

    res.status(200).json({
      message:
        "Sala actualizada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

export const deleteRoom = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const uid = req.uid!;
  const roomId = String(req.params.roomId);

if (!roomId) {
  res.status(400).json({
    message: "ID de sala inválido",
  });
  return;
}

  try {
    const roomRef =
      db.collection("rooms").doc(roomId);

    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      res.status(404).json({
        message: "Sala no encontrada",
      });
      return;
    }

    const roomData = roomDoc.data()!;

    if (roomData.adminUid !== uid) {
      res.status(403).json({
        message:
          "Solo el anfitrión puede eliminar esta sala",
      });
      return;
    }

    await roomRef.update({
      active: false,
    });

    res.status(200).json({
      message:
        "Sala eliminada correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};