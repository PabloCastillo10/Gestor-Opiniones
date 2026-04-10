import comentarioModel from "./comentario.model.js";
import publicModel from "../public/public.model.js";



export const saveComentario = async (req, res) => {
    
    const { texto, fecha} = req.body;
    const { titulo } = req.params;

    try {
        const publicacion = await publicModel.findOne({ titulo: titulo });


        if (!publicacion) {
            return res.status(404).json({
                success: false,
                msg: 'Publicación no encontrada'
            });
        }

        const comentario = new comentarioModel({
            user: req.usuario._id,
            texto,
            fecha,
            publicacion: publicacion._id,
            
        });
        await comentario.save();
        publicacion.comentarios.push(comentario._id);
        await publicacion.save();

         const comentarioGuardado = await comentarioModel.findById(comentario._id)
         .populate('publicacion', 'titulo')
         .populate('user', 'username');

        res.status(201).json({
            msg: "Comentario agregado correctamente",
            success: true,
            comentario : comentarioGuardado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: 'Error al guardar el comentario',
            error: error.message
        });
    }
};


export const updateComentario = async (req, res) => {
    const { id } = req.params;
    const { texto } = req.body;

    try {
        const comentario = await comentarioModel.findOne({ _id: id, status: true });

        if (!comentario) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        // Verificar que el comentario pertenece al usuario autenticado
         if (comentario.user.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                msg: "No tienes permiso para editar este comentario",
            });
        }

        comentario.texto = texto;
        await comentario.save();

        res.status(200).json({ msg: "Comentario actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el comentario", error: error.message });
    }
};


export const deleteComentario = async (req, res) => {
    const { id } = req.params;

    try {
        const comentario = await comentarioModel.findOne({ _id: id, status: true });

        if (!comentario) {
            return res.status(404).json({
                success: false,
                msg: "Comentario no encontrado"
            });
        }

        // Verificar que el comentario pertenece al usuario autenticado
         if (comentario.user.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                success: false,
                msg: "No tienes permiso para eliminar este comentario",
            });
        }

        comentario.status = false;
        await comentario.save();

        res.status(200).json({ msg: "Comentario eliminado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el comentario", error: error.message });
    }
};



