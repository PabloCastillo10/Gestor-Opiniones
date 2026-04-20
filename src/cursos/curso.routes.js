import { Router } from "express";
import { getCursos, createCurso, updateCurso, deleteCurso } from "./curso.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarAdmin } from "../middlewares/validate-admin.js";
import upload from "../middlewares/multer.js";


const router = Router();

/**
 * @openapi
 * /gestorOpinion/cursos:
 *   get:
 *     summary: Obtener todos los cursos activos
 *     tags: [Cursos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Resultados por página
 *     responses:
 *       200:
 *         description: Lista de cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Cursos obtenidos correctamente"
 *                 cursos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       cursoName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       estado:
 *                         type: boolean
 *       500:
 *         description: Error en el servidor
 */
router.get("/", getCursos)

/**
 * @openapi
 * /gestorOpinion/cursos/create:
 *   post:
 *     summary: Crear un nuevo curso (solo ADMIN)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cursoName]
 *             properties:
 *               cursoName:
 *                 type: string
 *                 example: "Programación Web"
 *               description:
 *                 type: string
 *                 example: "Curso de desarrollo web moderno"
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del curso (opcional)
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *       400:
 *         description: El curso ya existe
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - solo administradores
 */
router.post("/create", validarJWT, validarAdmin, upload.single('imagen'), createCurso)

/**
 * @openapi
 * /gestorOpinion/cursos/update/{id}:
 *   put:
 *     summary: Actualizar un curso (solo ADMIN)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cursoName:
 *                 type: string
 *                 example: "Programación Web Avanzada"
 *               description:
 *                 type: string
 *                 example: "Descripción actualizada"
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Nueva imagen del curso (opcional)
 *     responses:
 *       200:
 *         description: Curso actualizado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - solo administradores
 *       404:
 *         description: Curso no encontrado
 */
router.put("/update/:id", validarJWT, validarAdmin, upload.single('imagen'), updateCurso)

/**
 * @openapi
 * /gestorOpinion/cursos/delete/{id}:
 *   delete:
 *     summary: Eliminar un curso (soft delete, solo ADMIN)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del curso a eliminar
 *     responses:
 *       200:
 *         description: Curso eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado - solo administradores
 *       404:
 *         description: Curso no encontrado
 */
router.delete("/delete/:id", validarJWT, validarAdmin, deleteCurso)


export default router
