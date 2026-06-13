import { z } from "zod";

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener mínimo 3 caracteres")
    .max(50, "El nombre debe tener máximo 50 caracteres"),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;