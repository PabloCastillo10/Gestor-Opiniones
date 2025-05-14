import comentarioModel from "../comentario/comentario.model.js";


export const validateUserComentario = async (user) => {
    if (!user || user === "anonimo") return; 

    const comentario = await comentarioModel.findOne({ user });
    if (comentario) {
        throw new Error(`El usuario ${user} ya comentó antes`);
    }
}
