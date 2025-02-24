import categoriaModel from "../categorias/categoria.model.js";
import publicModel from "./public.model.js";
import userModel from "../users/user.model.js";
import comentarioModel from "../comentario/comentario.model.js";
import { generarJWT } from "../helpers/generate-jwt.js";
import { request, response } from "express";


export const savePublicacion = async (req, res) => {
    try {
        const data = req.body;
        const categoria = await categoriaModel.findOne({name: data.name});
        const user = await userModel.findOne({email: data.email});


        if(!categoria) {
            return res.status(404).json({
                succes: false,
                msg: 'Categoria No Encontrada'
            });
        }

        if(!user) {
            return res.status(404).json({
                succes: false,
                msg: 'Usuario No Encontrado'
            });
        }

        const publicacion = new publicModel({
            ...data,
            categoria: categoria._id,
            user: user._id,

        });
        await publicacion.save();

        const publicacionGuardada = await publicModel.findById(publicacion._id)
        .populate('categoria', 'name')
        .populate('user', 'email')

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
        .populate('categoria', 'name')
        .populate('user', 'email')
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

export const updatePublicacion = async (req, res = response) => {
    try {
        const {id} = req.params;
        const {_id, name, ...data} = req.body;

        
        if (name) {
            const nuevaCategoria = await categoriaModel.findOne({ name });
            if (!nuevaCategoria) {
                return res.status(404).json({
                    succes: false,
                    msg: "Categoría no encontrada",
                });
            }
        

            data.categoria = nuevaCategoria._id; 
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                succes: false,
                msg: "Usuario no autenticado",
            });
        }

        const publicacion = await publicModel.findById(id);
        if (!publicacion) {
            return res.status(404).json({
                succes: false,
                msg: "Publicación no encontrada",
            });
        }

        if (req.user.id.toString() !== publicacion.user.toString()) {
            return res.status(403).json({
                succes: false,
                msg: "No puedes actualizar porque no sos el usuario que creo esta publicación",
            });
        }
         await publicModel.findByIdAndUpdate(id, data, {new: true})
        res.status(200).json({
            succes: true,
            msg: 'Publicación Actualizada Correctamente',
            publicacion
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            msg: 'Error al actualizar la publicación',
            error: error.message
        })
    }
} 





export const deletePublicacion = async (req, res = response) => {
    try {
        const { id } = req.params;

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                succes: false,
                msg: "Usuario no autenticado",
            });
        }

        const publicacion = await publicModel.findById(id);
        if (!publicacion) {
            return res.status(404).json({
                succes: false,
                msg: "Publicación no encontrada",
            });
        }

        if (req.user.id.toString() !== publicacion.user.toString()) {
            return res.status(403).json({
                succes: false,
                msg: "No puedes eliminar porque no sos el usuario que creo esta publicación",
            });
        }

        await publicModel.findByIdAndUpdate(id, { status: false }, { new: true });

        res.status(200).json({
            succes: true,
            msg: "Publicación Eliminada Correctamente",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            succes: false,
            msg: "Error al eliminar la publicación",
            error,
        });
    }
};


export const activatePublicacion = async (req, res) => {
    const {id} = req.params;

    try {
        await publicModel.findByIdAndUpdate(id, {status: true}, {new: true});

        

        res.status(200).json({
            succes: true,
            msg: 'Publicación Activada Correctamente'
        });
    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error al activar la publicación',
            error: error.message
        })
    }
}