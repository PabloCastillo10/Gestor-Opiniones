import { Router } from "express";
import { login, register, getProfile, listUsers } from "./user.controller.js";
import { validarJWT } from "./middlewares/validar-jwt.js";
import { validarAdmin } from "./middlewares/validate-admin.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", validarJWT, validarAdmin, listUsers);
router.get("/profile", validarJWT, getProfile);

export default router;
