import { Router } from "express";
import { saveComentario, updateComentario, deleteComentario,  } from "./comentario.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";


const router = Router();

router.post("/:titulo",  validarCampos, saveComentario)

router.put("/:id", updateComentario)

router.delete("/:id", deleteComentario)



export default router;