import comentarioModel from "./comentario.model.js";
import publicModel from "../public/public.model.js";


export const saveComentario = async (req, res) => {
    const { titulo } = req.params;
    const data = req.body;
    console.log(data)

    try {
        const publicacion = await publicModel.findOne({ titulo: titulo });

        if (!publicacion) {
            return res.status(404).json({
                success: false,
                msg: 'Publicación no encontrada'
            });
        }

        const comentario = new comentarioModel({
            publicacion: publicacion._id,
            ...data
        });

        await comentario.save();

        publicacion.comentarios.push(comentario._id);
        await publicacion.save();

        res.status(201).json({
            msg: "Comentario agregado correctamente",
            success: true,
            comentario
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
    const { userComentario } = req.params;
    const { texto } = req.body;

    try {
        const comentario = await comentarioModel.findOne({ userComentario, status: true });

        if (!comentario) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        comentario.texto = texto;
        await comentario.save();

        res.status(200).json({ msg: "Comentario actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el comentario", error: error.message });
    }
};

export const deleteComentario = async (req, res) => {
    const { userComentario } = req.params;

    try {
        const comentario = await comentarioModel.findOne({ userComentario, status: true });

        if (!comentario) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        comentario.status = false;
        await comentario.save();

        res.status(200).json({ msg: "Comentario eliminado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el comentario", error: error.message });
    }
};


