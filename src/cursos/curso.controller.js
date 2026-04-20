import cursoModel from './curso.model.js';
import { uploadImageToCloudinary } from '../middlewares/cloudinary.js';



export const getCursos = async (req, res) => {
    try {
        const {page = 1, limit = 10} = req.query;
        const skip = (page - 1) * limit;
        const cursos = await cursoModel.find({ estado: true })
        .skip(skip)
        .limit(parseInt(limit));
        res.status(200).json({
            msg: 'Cursos obtenidos correctamente',
            cursos,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener cursos', error: error.message });
    }
};

//Funcion para crear curso
export const createCurso = async (req, res) => {
    const { cursoName, description } = req.body;

    try {
        const existingCurso = await cursoModel.findOne({ cursoName });
        if (existingCurso) {
            return res.status(400).json({ msg: 'El curso ya existe' });
        }

        let imagen;
        if (req.file) {
            imagen = await uploadImageToCloudinary(req.file.buffer);
        } else if (req.body.imagen) {
            imagen = req.body.imagen;
        }
        const newCurso = new cursoModel({ cursoName, description, imagen });
        await newCurso.save();

        res.status(201).json({
            msg: 'Curso creado exitosamente',
            curso: newCurso
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear curso', error: error.message });
    }
}

//Funcion para actualizar curso
export const updateCurso = async (req, res) => {
    const { id } = req.params;
    const { cursoName, description } = req.body;

    try {
        const updateData = {};
        if (cursoName) updateData.cursoName = cursoName;
        if (description) updateData.description = description;

        if (req.file) {
            updateData.imagen = await uploadImageToCloudinary(req.file.buffer);
        } else if (req.body.imagen) {
            updateData.imagen = req.body.imagen;
        }

        const updatedCurso = await cursoModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedCurso) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        res.status(200).json({
            msg: 'Curso actualizado exitosamente',
            curso: updatedCurso
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar curso', error: error.message });
    }
}

//Funcion para eliminar curso
export const deleteCurso = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCurso = await cursoModel.findOne({ _id: id });

        if (!deletedCurso) {
            return res.status(404).json({ msg: 'Curso no encontrado' });
        }

        deletedCurso.estado = false;
        await deletedCurso.save();

        res.status(200).json({ msg: 'Curso eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar curso', error: error.message });
    }
}



export const TallerCurso = async () => {
    try {

        const verifyCurso = await cursoModel.findOne({ cursoName: "Taller" });
        if (!verifyCurso) {
            const tallerCurso = new cursoModel({
                cursoName: "Taller",
                description: "Curso creado desde el sistema"
            });
    
            await tallerCurso.save();
    
            console.log("Curso Taller creado con éxito");
        } 
    } catch (error) {
        console.error("Error al crear el curso de Taller: ", error);
    }
}



export const PracticaCurso = async () => {
    try {

        const verifyCurso = await cursoModel.findOne({ cursoName: "Practica" });
        if (!verifyCurso) {
            const practicaCurso = new cursoModel({
                cursoName: "Practica",
                description: "Curso creado desde el sistema"
            });
    
            await practicaCurso.save();
    
            console.log("Curso Pracitca creado con éxito");
        } 
    } catch (error) {
        console.error("Error al crear el curso de Practica: ", error);
    }
}



export const TecnologiaCurso = async () => {
    try {

        const verifyCurso = await cursoModel.findOne({ cursoName: "Tecnologia" });
        if (!verifyCurso) {
            const tecnologiaCurso = new cursoModel({
                cursoName: "Tecnologia",
                description: "Curso creado desde el sistema"
            });
    
            await tecnologiaCurso.save();
    
            console.log("Curso Tecnologia creado con éxito");
        } 
    } catch (error) {
        console.error("Error al crear el curso de Tecnologia: ", error);
    }
}


