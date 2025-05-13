import { Router } from "express";
import { saveComentario, updateComentario, deleteComentario,  } from "./comentario.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";


const router = Router();

router.post("/:titulo",  validarCampos, saveComentario)

router.put("/:publicacionId/:comentarioId",  updateComentario)

router.delete("/:publicacionId/:comentarioId", deleteComentario)



export default router;