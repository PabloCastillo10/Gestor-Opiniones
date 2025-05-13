'use strict';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {dbConnection} from './mongo.js';

import cursoRoutes from '../src/cursos/curso.routes.js'
import publicacionRoutes from '../src/public/public.routes.js'
import comentarioRoutes from '../src/comentario/comentario.routes.js'
import { TallerCurso } from '../src/cursos/curso.controller.js';
import { TecnologiaCurso } from '../src/cursos/curso.controller.js';
import { PracticaCurso } from '../src/cursos/curso.controller.js';

const configurarMiddlewares = (app) => {
    app.use(express.urlencoded({extended: false}));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('dev'));
}


const routes = (app) => {
    app.use('/gestorOpinion/cursos', cursoRoutes);
    app.use('/gestorOpinion/publicaciones', publicacionRoutes);
    app.use('/gestorOpinion/comentarios', comentarioRoutes);
}
 const conectarDB = async  () => {
    try{
        await dbConnection();
        console.log("Conexión a la base de datos exitosa");
        await TallerCurso();
        await TecnologiaCurso();
        await PracticaCurso();
    }catch(error){
        console.error('Error conectando a la base de datos', error);
        process.exit(1);
    }
}
export const initServer = async () => {
    const app = express();
    const port = process.env.PORT || 3000;
    await conectarDB();
    configurarMiddlewares(app);
    routes(app);
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

