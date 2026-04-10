import { Router } from "express";
import { savePublicacion, getPublicaciones, getPublicacionById, getPublicacionesByCurso } from "./public.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";


const router = Router();

router.post(
    "/", validarJWT, savePublicacion)

router.get("/", getPublicaciones)
router.get("/curso/:cursoName", getPublicacionesByCurso)
router.get("/:id", getPublicacionById)




export default router;

