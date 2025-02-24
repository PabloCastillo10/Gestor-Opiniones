import categoriaModel from "../categorias/categoria.model.js";
import publicModel from "./public.model.js";
import userModel from "../users/user.model.js";


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

export const getPublicaciones = async (req, res) => {
    try{
        const publicaciones = await publicModel.find()
        .populate('categoria', 'name')
        .populate('user', 'email')
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
        const {_id, name, email, ...data} = req.body;

        
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

        if (email) {
            const nuevoUsuario = await userModel.findOne({ email });
            if (!nuevoUsuario) {
                return res.status(404).json({
                    succes: false,
                    msg: "Usuario no encontrado",
                });
            }
            data.user = nuevoUsuario._id; 
        }

        

        const publicacion = await publicModel.findByIdAndUpdate(id, data, {new: true})

        

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


export const deletePublicacion = async (req, res) => {

    const {id} = req.params;

    try{
        
        
        
        await publicModel.findByIdAndUpdate(id, {status: false}, {new: true});
        
        res.status(200).json({
            succes: true,
            msg: 'Publicación Eliminada Correctamente'
        });
    } catch (error) {
        res.status(500).json({
            succes: false,
            msg: 'Error al eliminar la publicación',
            error: error.message
        })
    }
}

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