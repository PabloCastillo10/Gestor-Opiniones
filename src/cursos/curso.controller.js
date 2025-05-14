import cursoModel from './curso.model.js';
import {request, response} from 'express';



export const getCursos = async (req, res) => {
    try {
        const cursos = await cursoModel.find();
        res.status(200).json(cursos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener cursos', error: error.message });
    }
};



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


