import { Router } from "express";
import { savePublicacion, getPublicaciones, getPublicacionById, getPublicacionesByCurso, updatePublicacion, deletePublicacion, toggleLikePublicacion } from "./public.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";


const router = Router();

/**
 * @openapi
 * /gestorOpinion/publicaciones:
 *   post:
 *     summary: Crear una nueva publicacion
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, curso, texto]
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Introduccion a Node.js"
 *               curso:
 *                 type: string
 *                 example: "Tecnologia"
 *               texto:
 *                 type: string
 *                 example: "Node.js es un entorno de ejecucion para JavaScript"
 *     responses:
 *       201:
 *         description: Publicacion guardada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 succes:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 publicacion:
 *                   type: object
 *       400:
 *         description: Curso no encontrado
 *       401:
 *         description: No autorizado
 *   get:
 *     summary: Obtener todas las publicaciones activas con paginacion y busqueda
 *     tags: [Publicaciones]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero de pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Resultados por pagina
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto a buscar en titulo y contenido
 *         example: "node"
 *     responses:
 *       200:
 *         description: Lista de publicaciones
 *       500:
 *         description: Error en el servidor
 */
router.post("/", validarJWT, savePublicacion)
router.get("/", getPublicaciones)

/**
 * @openapi
 * /gestorOpinion/publicaciones/curso/{cursoName}:
 *   get:
 *     summary: Obtener publicaciones filtradas por curso
 *     tags: [Publicaciones]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: cursoName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del curso
 *         example: "Tecnologia"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Publicaciones del curso
 *       404:
 *         description: Curso no encontrado
 */
router.get("/curso/:cursoName", getPublicacionesByCurso)

/**
 * @openapi
 * /gestorOpinion/publicaciones/{id}/like:
 *   post:
 *     summary: Dar o quitar like a una publicacion
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicacion
 *     responses:
 *       200:
 *         description: Like agregado o quitado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Like agregado a la publicacion"
 *                 likes:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Publicacion no encontrada
 */
router.post("/:id/like", validarJWT, toggleLikePublicacion)

/**
 * @openapi
 * /gestorOpinion/publicaciones/{id}:
 *   get:
 *     summary: Obtener una publicacion por ID
 *     tags: [Publicaciones]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicacion
 *     responses:
 *       200:
 *         description: Publicacion encontrada
 *       404:
 *         description: Publicacion no encontrada
 *   put:
 *     summary: Actualizar una publicacion (dueno o ADMIN)
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicacion
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Titulo actualizado"
 *               texto:
 *                 type: string
 *                 example: "Contenido actualizado"
 *     responses:
 *       200:
 *         description: Publicacion actualizada correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso para editar esta publicacion
 *       404:
 *         description: Publicacion no encontrada
 *   delete:
 *     summary: Eliminar una publicacion (soft delete, dueno o ADMIN)
 *     tags: [Publicaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la publicacion
 *     responses:
 *       200:
 *         description: Publicacion eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso para eliminar esta publicacion
 *       404:
 *         description: Publicacion no encontrada
 */
router.get("/:id", getPublicacionById)
router.put("/:id", validarJWT, updatePublicacion)
router.delete("/:id", validarJWT, deletePublicacion)




export default router;
