import { body } from "express-validator";
import { validarCampos } from "./validar-campos";
import {existenteEmailUser} from "../helpers/db-validator-.js";


export const registerUserValidator = [
    body("name", "El nombre es obligatorio").not().isEmpty(),
    body("username", "El nombre de usuario es obligatorio").not().isEmpty(),
    body("email", "El email es obligatorio").notEmpty().isEmail().withMessage("Debe ser un email valido"),
    body("email").custom(existenteEmailUser),
    body("password", "La contraseña debe de ser de 6 caracteres").isLength({ min: 6 }),
    validarCampos
]

export const loginUserValidator = [
    body("email").optional().isEmail().withMessage("Ingrese un email valido"),
    body("username").optional().isString().withMessage("Enter a valid username"),
    body("password", "La contraseña es obligatoria y debe tener al menos 8 caracteres").isLength({ min: 8 }),
    validarCampos
]