import { z } from "zod";

export const completeProfileSchema = z.object({
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username debe tener máximo 20 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "El username solo puede contener minúsculas, números y guiones bajos"
    ),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  username: completeProfileSchema.shape.username,
});

export type RegisterInput = z.infer<typeof registerSchema>;
