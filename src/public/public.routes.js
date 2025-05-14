import { Router } from "express";
import { check } from "express-validator";
import { savePublicacion, getPublicaciones } from "./public.controller.js";


const router = Router();

router.post(
    "/", savePublicacion)

router.get("/", getPublicaciones)





export default router;

