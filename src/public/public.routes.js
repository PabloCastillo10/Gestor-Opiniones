import { Router } from "express";
import { check } from "express-validator";
import { savePublicacion, getPublicaciones, updatePublicacion, deletePublicacion, activatePublicacion } from "./public.controller.js";
import {validarCampos} from "../middlewares/validar-campos.js";
import {validarUserJWT} from "../middlewares/validar-jwt.js";

const router = Router();

router.post(
    "/",validarCampos, savePublicacion)

router.get("/", getPublicaciones)

router.put("/:id", updatePublicacion, validarUserJWT)

router.delete("/:id", deletePublicacion, validarUserJWT)

router.put("/activate/:id", activatePublicacion, validarUserJWT)

export default router;

