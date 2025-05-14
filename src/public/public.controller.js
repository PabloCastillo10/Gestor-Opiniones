
import publicModel from "./public.model.js";
import comentarioModel from "../comentario/comentario.model.js";
import { request, response } from "express";
import cursoModel from "../cursos/curso.model.js";
import { validateTitulo, validateAutor } from "../helpers/db-validator-publicacion.js";


export const savePublicacion = async (req, res) => {
   const data = req.body || {};
    console.log(data)
    try {
         const curso = await cursoModel.findOne({ cursoName: data.cursoName});

        if(!curso) {
            console.log(curso)
            return res.status(404).json({
                succes: false,
                msg: 'Curso no encontrado'
                
            });
        }


        await validateTitulo(data.titulo);
        await validateAutor(data.autor);

        
        const publicacion = new publicModel({
            ...data,
            cursoName: curso.cursoName,
            curso: curso._id,

        });
       
        await publicacion.save();

        const publicacionGuardada = await publicModel.findById(publicacion._id)
        .populate('curso', 'name')
        

        return res.status(201).json({
            succes: true,
            msg: 'Publicación Guardada Correctamente',
            publicacion: publicacionGuardada
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            msg: 'Error al guardar la publicación',
            error: error.message
        })
    }
}

export const getPublicaciones = async (req = request, res = response) => {
    try{
        const publicaciones = await publicModel.find()
        .populate('curso', 'name')
        .populate({
            path: 'comentarios',
            match: { status: true }, 

        });
        res.status(200).json({
            succes: true,
            msg: 'Publicaciones Obtenidas Correctamente',
            publicaciones
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error al obtener las publicaciones',
            error: error.message
        })
    }
}


