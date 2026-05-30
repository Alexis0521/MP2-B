import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "MP2 API",
    version: "1.0.0",
    description: "API del proyecto MP2 - Estudio Colaborativo",
  },
  servers: [
    {
      url: "/api",
      description: "Servidor local",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      UserProfile: {
        type: "object",
        properties: {
          uid: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          username: { type: "string" },
          usernameLower: { type: "string" },
          email: { type: "string" },
          avatarUrl: { type: "string", nullable: true },
          authProvider: { type: "string" },
          profileComplete: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CompleteProfileInput: {
        type: "object",
        required: ["username"],
        properties: {
          username: {
            type: "string",
            minLength: 3,
            maxLength: 20,
            pattern: "^[a-z0-9_]+$",
            description: "Solo minúsculas, números y guiones bajos",
          },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["firstName", "lastName", "username"],
        properties: {
          firstName: { type: "string", minLength: 1 },
          lastName: { type: "string", minLength: 1 },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 20,
            pattern: "^[a-z0-9_]+$",
            description: "Solo minúsculas, números y guiones bajos",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/users/me": {
      get: {
        summary: "Obtener perfil del usuario autenticado",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Perfil del usuario",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    {
                      type: "object",
                      properties: {
                        profileComplete: { type: "boolean", enum: [false] },
                      },
                    },
                    {
                      type: "object",
                      properties: {
                        profileComplete: { type: "boolean", enum: [true] },
                        user: { $ref: "#/components/schemas/UserProfile" },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "No autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/complete-profile": {
      post: {
        summary: "Completar perfil de usuario (Google)",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompleteProfileInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Perfil completado exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos inválidos o perfil ya completo",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Username no disponible",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "No autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/users/register": {
      post: {
        summary: "Registrar usuario (Email/Password)",
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuario registrado exitosamente",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Datos inválidos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "409": {
            description: "Username no disponible",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "No autenticado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
