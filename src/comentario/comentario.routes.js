import { Router } from "express";
import { saveComentario, updateComentario, deleteComentario } from "./comentario.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

/**
 * @openapi
 * /gestorOpinion/comentarios/{titulo}:
 *   post:
 *     summary: Agregar un comentario a una publicacion
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: titulo
 *         required: true
 *         schema:
 *           type: string
 *         description: Titulo de la publicacion a comentar
 *         example: "Introduccion a Node.js"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [texto, fecha]
 *             properties:
 *               texto:
 *                 type: string
 *                 example: "Excelente publicacion, muy util"
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-10"
 *     responses:
 *       201:
 *         description: Comentario agregado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 comentario:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     texto:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                     publicacion:
 *                       type: object
 *                       properties:
 *                         titulo:
 *                           type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Publicacion no encontrada
 */
router.post("/:titulo", validarJWT, validarCampos, saveComentario)

/**
 * @openapi
 * /gestorOpinion/comentarios/{id}:
 *   put:
 *     summary: Actualizar un comentario (solo el dueno)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [texto]
 *             properties:
 *               texto:
 *                 type: string
 *                 example: "Comentario actualizado"
 *     responses:
 *       200:
 *         description: Comentario actualizado correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso para editar este comentario
 *       404:
 *         description: Comentario no encontrado
 *   delete:
 *     summary: Eliminar un comentario (soft delete, solo el dueno)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comentario a eliminar
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permiso para eliminar este comentario
 *       404:
 *         description: Comentario no encontrado
 */
router.put("/:id", validarJWT, updateComentario)
router.delete("/:id", validarJWT, deleteComentario)


export default router;
