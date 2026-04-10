
import publicModel from "./public.model.js";
import { request, response } from "express";
import cursoModel from "../cursos/curso.model.js";
import { validateTitulo } from "../helpers/db-validator-publicacion.js";


export const savePublicacion = async (req, res) => {
   const data = req.body || {};
   const autor = req.usuario;
    try {
         const curso = await cursoModel.findOne({ cursoName: data.curso });
         if (!curso) {
            return res.status(400).json({
                succes: false,
                msg: `Curso "${data.curso}" no encontrado`,
            });
         }

         const fechaFinal = data.fecha ? new Date(data.fecha) : new Date();

        await validateTitulo(data.titulo);

        
        const publicacion = new publicModel({
            ...data,
            curso: curso._id,
            fecha: fechaFinal,
            autor: autor._id

        });
       
        await publicacion.save();

        const publicacionGuardada = await publicModel.findById(publicacion._id)
        .populate('curso', 'cursoName')
        .populate('autor', 'username');
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
        //Añadir paginacion
        const { page = 1, limit = 10 } = req.query;//Valor por defecto para page y limit
        const skip = (page - 1) * limit; //Calcular el número de documentos a omitir
        const paginatedPublicaciones = await publicModel.find()
            .populate('curso', 'cursoName')
            .populate('autor', 'username')
            .populate({
                path: 'comentarios',
                match: { status: true },
            })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            succes: true,
            msg: 'Publicaciones Obtenidas Correctamente',
            publicaciones: paginatedPublicaciones,
             page: parseInt(page),
             limit: parseInt(limit)
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error al obtener las publicaciones',
            error: error.message
        })
    }
}


//Buscar publicaciones por id

export const getPublicacionById = async (req = request, res = response) => {
    const {id} = req.params;

    try {
        const publicacion = await publicModel.findById(id)
        .populate('curso', 'cursoName')
        .populate('autor', 'username')

        if (!publicacion) {
            return res.status(404).json({
                succes: false,
                msg: 'Publicación no encontrada',
            });
        }

        res.status(200).json({
            succes: true,
            msg: 'Publicación Obtenida Correctamente',
            publicacion
        })
    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error al obtener la publicación',
            error: error.message
        })
    }
}

//Buscar publicaciones por curso


export const getPublicacionesByCurso = async (req = request, res = response) => {
    const {cursoName} = req.params;

    try {
        const curso = await cursoModel.findOne({ cursoName });
        if (!curso) {
            return res.status(404).json({
                succes: false,
                msg: `Curso "${cursoName}" no encontrado`,
            });
        }

        const publicaciones = await publicModel.find({ curso: curso._id })
        .populate('curso', 'cursoName')
        .populate('autor', 'username');

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