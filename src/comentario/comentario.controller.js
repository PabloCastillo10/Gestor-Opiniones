import comentarioModel from "./comentario.model.js";
import publicModel from "../public/public.model.js";


export const saveComentario = async (req, res) => {
    const {publicacionId} = req.params;
    const {texto} = req.body;

    try{
        const publicacion = await publicModel.findById(publicacionId);

        if(!publicacion){
            return res.status(404).json({
                succes: false,
                msg: 'Publicación no encontrada'
            });
        }


        const comentario = new comentarioModel({
            publicacion: publicacionId,
            user: req.user._id,
            texto
        });

        await comentario.save();

        publicacion.comentarios.push(comentario._id);
        await publicacion.save();

        res.status(201).json({
            msg: "Comentario agregado correctamente",
            succes: true,
            comentario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            succes: false,
            msg: 'Error al guardar el comentario',
            error: error.message
        });
    }
}


export const updateComentario = async (req, res) => {
    
    try {
        const { comentarioId } = req.params;
        const { texto } = req.body;
        const comentario = await comentarioModel.findById(comentarioId);

        if (!req.user || !req.user.id) {
            return res.status(401).json({
                succes: false,
                msg: "Usuario no autenticado",
            });
        }


        if (!comentario) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        
        if (req.user.id.toString() !== comentario.user.toString()) {
            return res.status(403).json({
                succes: false,
                msg: "No puedes editar porque no sos el usuario que creo este comentario",
            });
        }
       
        
        if (req.user.id.toString() !== comentario.user.toString()) {
            return res.status(403).json({
                succes: false,
                msg: "No puedes eliminar porque no sos el usuario que creo esta publicación",
            });
        }
        if (!comentario.status) {
            return res.status(400).json({ msg: "No puedes editar un comentario eliminado" });
        }

        comentario.texto = texto;
        await comentario.save();

        res.status(200).json({ msg: "Comentario actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar el comentario", error: error.message });
    }
};

export const deleteComentario = async (req, res) => {
    
    try {
        const { comentarioId } = req.params;
        const comentario = await comentarioModel.findById(comentarioId);

        
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                succes: false,
                msg: "Usuario no autenticado",
            });
        }

        if (!comentario) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }

        if (req.user.id.toString() !== comentario.user.toString()) {
            return res.status(403).json({
                succes: false,
                msg: "No puedes eliminar porque no sos el usuario que creo este comentario",
            });
        }

        comentario.status = false;
        await comentario.save();

        res.status(200).json({ msg: "Comentario eliminado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar el comentario", error: error.message });
    }
};

export const activateComentario = async (req, res) => {
    const { comentarioId } = req.params;
    
    try {
        const comentario = await comentarioModel.findById(comentarioId);
        
        if (!comentario) {
            return res.status(404).json({ msg: "Comentario no encontrado" });
        }
        
        comentario.status = true;
        await comentario.save();
        
        res.status(200).json({ msg: "Comentario activado correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al activar el comentario", error: error.message });
    }
}