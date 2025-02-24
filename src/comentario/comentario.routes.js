import { Router } from "express";
import { saveComentario, updateComentario, deleteComentario, activateComentario } from "./comentario.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/:publicacionId", validarUserJWT, validarCampos, saveComentario)

router.put("/:publicacionId/:comentarioId", validarUserJWT, updateComentario)

router.delete("/:publicacionId/:comentarioId", validarUserJWT, deleteComentario)

router.put("/:publicacionId/:comentarioId/activate", validarUserJWT, activateComentario)

export default router;