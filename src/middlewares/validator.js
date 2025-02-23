import { body } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { existenteEmailUser, existenteNameCategoria } from "../helpers/db-validator-.js";

export const registerUserValidator = [
    body("name", "El nombre es obligatorio").notEmpty(),
    body("age", "La edad es obligatoria").notEmpty().isNumeric().withMessage("La edad debe ser un número"),
    body("surname", "El apellido es obligatorio").notEmpty(),
    body("email", "El email es obligatorio").notEmpty().isEmail().withMessage("Debe ser un correo válido"),
    body("email").custom(existenteEmailUser),
    body("password", "La contraseña debe tener al menos 8 caracteres").isLength({ min: 8 }),
    validarCampos,
];


export const loginUserValidator = [
    body("email").optional().isEmail().withMessage("Ingrese un correo válido"),
    body("username").optional().isString().withMessage("Enter a valid username"),
    body("password", "La contraseña debe tener al menos 8 caracteres").isLength({ min: 8 }),
    validarCampos,
];

export const validatorCategoria = [
    body('name', 'The name is required').not().isEmpty(),
    body('name').custom(existenteNameCategoria),
    body('description', 'The description is required').not().isEmpty(),
    validarCampos
];
