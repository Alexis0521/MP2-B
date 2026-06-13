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
      UpdateProfileInput: {
          type: "object",
          required: ["firstName", "lastName", "username"],
          properties: {
            firstName: {
              type: "string",
              minLength: 1
            },
            lastName: {
              type: "string",
              minLength: 1
            },
            username: {
              type: "string",
              minLength: 3,
              maxLength: 20,
              pattern: "^[a-z0-9_]+$"
            }
          }
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
                    profileComplete: {
                      type: "boolean",
                      enum: [false],
                    },
                  },
                },
                {
                  type: "object",
                  properties: {
                    profileComplete: {
                      type: "boolean",
                      enum: [true],
                    },
                    user: {
                      $ref: "#/components/schemas/UserProfile",
                    },
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
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },

  delete: {
    summary: "Eliminar cuenta del usuario autenticado",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    responses: {
      "200": {
        description: "Cuenta eliminada correctamente",
      },
      "404": {
        description: "Usuario no encontrado",
      },
      "401": {
        description: "No autenticado",
      },
      "500": {
        description: "Error interno",
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

"/users/profile": {
  put: {
    summary: "Actualizar perfil de usuario",
    tags: ["Users"],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/UpdateProfileInput",
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Perfil actualizado correctamente",
      },
      "400": {
        description: "Datos inválidos",
      },
      "404": {
        description: "Usuario no encontrado",
      },
      "409": {
        description: "Username no disponible",
      },
      "401": {
        description: "No autenticado",
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
    "/rooms": {
  post: {
    summary: "Crear sala",
    tags: ["Rooms"],
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
                minLength: 3,
                maxLength: 50,
              },
            },
          },
        },
      },
    },
    responses: {
      "201": {
        description: "Sala creada exitosamente",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                roomId: {
                  type: "string",
                },
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
      "400": {
        description: "Datos inválidos",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      "401": {
        description: "No autenticado",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },

  get: {
  summary: "Listar salas creadas por el usuario",
  tags: ["Rooms"],
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      description: "Listado de salas",
    },
    "401": {
      description: "No autenticado",
    },
  },
},

},

"/rooms/{roomId}": {
  get: {
    summary: "Obtener una sala por ID",
    tags: ["Rooms"],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "roomId",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      "200": {
        description: "Sala encontrada",
      },
      "404": {
        description: "Sala no encontrada",
      },
      "401": {
        description: "No autenticado",
      },
    },
  },

  put: {
    summary: "Actualizar nombre de una sala",
    tags: ["Rooms"],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "roomId",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name"],
            properties: {
              name: {
                type: "string",
                minLength: 3,
                maxLength: 50,
              },
            },
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Sala actualizada correctamente",
      },
      "400": {
        description: "Datos inválidos",
      },
      "403": {
        description: "Solo el anfitrión puede editar la sala",
      },
      "404": {
        description: "Sala no encontrada",
      },
    },
  },

  delete: {
    summary: "Eliminar sala",
    tags: ["Rooms"],
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "roomId",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      "200": {
        description: "Sala eliminada correctamente",
      },
      "403": {
        description: "Solo el anfitrión puede eliminar la sala",
      },
      "404": {
        description: "Sala no encontrada",
      },
    },
  },
},

},
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
