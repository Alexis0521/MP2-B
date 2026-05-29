import { Request, Response } from "express";
import { db, auth } from "../config/firebase";
import { completeProfileSchema, registerSchema } from "../schemas/user.schema";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.uid!;

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      res.json({ profileComplete: false });
      return;
    }

    const data = userDoc.data()!;

    if (!data.profileComplete) {
      res.json({ profileComplete: false });
      return;
    }

    const userProfile = {
      uid,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      username: data.username || "",
      usernameLower: data.usernameLower || "",
      email: data.email || "",
      avatarUrl: data.avatarUrl || null,
      authProvider: data.authProvider || "google",
      profileComplete: true,
      createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
    };

    res.json({ profileComplete: true, user: userProfile });
  } catch (error) {
    console.error("Error en getMe:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const completeProfile = async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.uid!;

  const parseResult = completeProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: parseResult.error.issues,
    });
    return;
  }

  const { username } = parseResult.data;
  const usernameLower = username.toLowerCase();

  try {
    const userRecord = await auth.getUser(uid);
    const userDoc = await db.collection("users").doc(uid).get();
    let existingData: any = {};

    if (userDoc.exists) {
      existingData = userDoc.data()!;
      if (existingData.profileComplete) {
        res.status(400).json({ message: "El perfil ya está completo" });
        return;
      }
    }

    const transactionResult = await db.runTransaction(async (transaction) => {
      const usernameRef = db.collection("usernames").doc(usernameLower);
      const userRef = db.collection("users").doc(uid);

      const usernameDoc = await transaction.get(usernameRef);

      if (usernameDoc.exists) {
        return { success: false, reason: "USERNAME_TAKEN" };
      }

      const now = new Date();

      transaction.set(usernameRef, { uid });
      transaction.set(userRef, {
        firstName: existingData.firstName || userRecord.displayName?.split(" ")[0] || "",
        lastName: existingData.lastName || userRecord.displayName?.split(" ").slice(1).join(" ") || "",
        username,
        usernameLower,
        email: userRecord.email || existingData.email || "",
        avatarUrl: userRecord.photoURL || existingData.avatarUrl || null,
        authProvider: existingData.authProvider || "google",
        profileComplete: true,
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      });

      return { success: true };
    });

    if (!transactionResult.success) {
      res.status(409).json({ message: "El username no está disponible" });
      return;
    }

    res.status(200).json({ message: "Perfil completado exitosamente" });
  } catch (error) {
    console.error("Error en completeProfile:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.uid!;

  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: parseResult.error.issues,
    });
    return;
  }

  const { firstName, lastName, username } = parseResult.data;
  const usernameLower = username.toLowerCase();

  try {
    const userRecord = await auth.getUser(uid);

    const transactionResult = await db.runTransaction(async (transaction) => {
      const usernameRef = db.collection("usernames").doc(usernameLower);
      const userRef = db.collection("users").doc(uid);

      const usernameDoc = await transaction.get(usernameRef);

      if (usernameDoc.exists) {
        return { success: false, reason: "USERNAME_TAKEN" };
      }

      const now = new Date();

      transaction.set(usernameRef, { uid });
      transaction.set(userRef, {
        firstName,
        lastName,
        username,
        usernameLower,
        email: userRecord.email || "",
        avatarUrl: userRecord.photoURL || null,
        authProvider: "password",
        profileComplete: true,
        createdAt: now,
        updatedAt: now,
      });

      return { success: true };
    });

    if (!transactionResult.success) {
      res.status(409).json({ message: "El username no está disponible" });
      return;
    }

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const checkUsername = async (req: Request, res: Response) => {
  const { username } = req.query;
  if (!username || typeof username !== "string") {
    res.status(400).json({ message: "Username requerido" });
    return;
  }
  const usernameLower = username.toLowerCase();
  try {
    const usernameDoc = await db.collection("usernames").doc(usernameLower).get();
    res.json({ available: !usernameDoc.exists });
  } catch (error) {
    console.error("Error en checkUsername:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
