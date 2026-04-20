import { Router } from "express";
import {
  login,
  register,
  getProfile,
  listUsers,
  toggleUserStatus,
  editProfile,
} from "./user.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarAdmin } from "../middlewares/validate-admin.js";
import upload from "../middlewares/multer.js";

const router = Router();
/**
 * @openapi
 * /gestorOpinion/users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@gmail.com"
 *               username:
 *                 type: string
 *                 example: "user"
 *               password:
 *                 type: string
 *                 example: "user123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Credenciales incorrectas
 *       403:
 *         description: Usuario desactivado
 */
router.post("/login", login);

/**
 * @openapi
 * /gestorOpinion/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, surname, username, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John"
 *               surname:
 *                 type: string
 *                 example: "Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 example: "johndoe@gmail.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de perfil del usuario (opcional)
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *       500:
 *         description: Error en el servidor (puede ser email o username duplicado)
 */
router.post("/register", upload.single("avatar"), register);

/**
 * @openapi
 * /gestorOpinion/users/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: No autorizado
 *   put:
 *     summary: Editar el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *              avatar:
 *                 type: string
 *                 format: binary
 *                 description: Nueva imagen de perfil del usuario (opcional)
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       401:
 *         description: No autorizado
 *
 * /gestorOpinion/users/users:
 *   get:
 *     summary: Listar todos los usuarios (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Acceso denegado - solo para administradores
 *
 * /gestorOpinion/users/toggle-status/{id}:
 *   put:
 *     summary: Cambiar estado del usuario (solo ADMIN)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       403:
 *         description: Acceso denegado
 * */
router.get("/users", validarJWT, validarAdmin, listUsers);
router.get("/profile", validarJWT, getProfile);
router.put("/profile", validarJWT, upload.single("avatar"), editProfile);
router.put("/toggle-status/:id", validarJWT, validarAdmin, toggleUserStatus);

export default router;
