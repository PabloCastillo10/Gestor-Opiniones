import { Router } from "express";
import { saveComentario, updateComentario, deleteComentario,  } from "./comentario.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

router.post("/:titulo", validarJWT, validarCampos, saveComentario)

router.put("/:id", validarJWT, updateComentario)

router.delete("/:id", validarJWT, deleteComentario)


export default router;