'use strict';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {dbConnection} from './mongo.js';
import userRoutes from '../src/users/user.routes.js'
import categoriaRoutes from '../src/categorias/categoria.routes.js'
import publicacionRoutes from '../src/public/public.routes.js'
import { createAdmin } from '../src/users/user.controller.js';
import { defaultCategoria } from '../src/categorias/categoria.controller.js';

const configurarMiddlewares = (app) => {
    app.use(express.urlencoded({extended: false}));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use(morgan('dev'));
}


const routes = (app) => {
    app.use('/gestorOpinion/users', userRoutes);
    app.use('/gestorOpinion/categorias', categoriaRoutes);
    app.use('/gestorOpinion/publicaciones', publicacionRoutes);
}
 const conectarDB = async  () => {
    try{
        await dbConnection();
        console.log("Conexión a la base de datos exitosa");
        await createAdmin();
        await defaultCategoria();
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

