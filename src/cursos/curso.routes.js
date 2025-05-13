import { Router } from "express";
import { check } from "express-validator";
import { getCursos } from "./curso.controller.js";


const router = Router();

router.get("/", getCursos)


export default router