import { Router } from "express";
import { getCursos, createCurso, updateCurso, deleteCurso } from "./curso.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { validarAdmin } from "../middlewares/validate-admin.js";


const router = Router();

router.get("/", getCursos)
router.post("/create", validarJWT, validarAdmin, createCurso)
router.put("/update/:id", validarJWT, validarAdmin, updateCurso)
router.delete("/delete/:id", validarJWT, validarAdmin, deleteCurso)


export default router