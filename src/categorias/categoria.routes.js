import express from 'express';
import { check } from 'express-validator';
import { createCategory, getCategorias, updateCategory, deleteCategory } from './categoria.controller.js';
import { validarUserJWT } from '../middlewares/validar-jwt.js';
import { validarCampos } from '../middlewares/validar-campos.js';
import { existeCategoriaById } from '../helpers/db-validator-.js';

import { validatorCategoria } from '../middlewares/validator.js';


const router = express.Router();


router.post(
    '/',
    [
        validarUserJWT,
        validarCampos
    ],
    createCategory
);

router.get(
    '/',
    getCategorias
);



router.put(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategoriaById),
        validarCampos
    ],
    updateCategory
);

router.delete(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCategoriaById),
        validarCampos
    ],
    deleteCategory
);

export default router;