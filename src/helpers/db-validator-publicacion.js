import publicModel from "../public/public.model.js";





export const validateTitulo = async (titulo) => {
    const publicacion = await publicModel.findOne({ titulo });
    if (publicacion) {
        throw new Error(`El título ${titulo} de la publicacion ya existe`);
    }
}


export const validateAutor = async (autor) => {
    const autorexist = await publicModel.findOne({ autor });
    if (autorexist) {
        throw new Error(`El autor ${autor} ya existe`);
    }
}