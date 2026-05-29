import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token de autenticación requerido" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Error verificando token:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
