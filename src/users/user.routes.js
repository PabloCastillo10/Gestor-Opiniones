import { Router } from "express";
import { check } from "express-validator";
import { existeUserById } from "../helpers/db-validator-.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { login, register, updateProfile } from "./user.controller.js";
import { registerUserValidator, loginUserValidator } from "../middlewares/validator.js";
import { deleteFileOnError } from "../middlewares/delete-file.on-error.js";

const router = Router();

            router.post(
                "/login",
                loginUserValidator,
                deleteFileOnError,
                login
            )
            
            router.post(
                "/register",
                registerUserValidator,
                deleteFileOnError,
                register
            )

            router.put(
                "/:id",
                validarUserJWT,
                validarCampos,
                updateProfile
            )
            
       

export default router;