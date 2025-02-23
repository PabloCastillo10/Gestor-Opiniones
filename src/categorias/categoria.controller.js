import categoriaModel from '../categorias/categoria.model.js';
import {request, response} from 'express';


export const createCategory = async (req, res) => {
    try {
        const { name, description, role } = req.body;

        if (role && role !== "ADMIN_ROLE") {
            return res.status(403).json({ 
                msg: "No tienes permiso para asignar este rol de categoria" 
            });
        }

        const nuevaCategoria = await categoriaModel.create({ name, description });
        res.status(201).json({ 
            msg: "Categoría creada exitosamente", 
            categoria: nuevaCategoria 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al crear la categoría", error: error.message });
    }
};

export const getCategorias = async (req, res) => {
    try {
        const categorias = await categoriaModel.find();
        res.status(200).json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener categorías', error: error.message });
    }
};


export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, role } = req.body; 

    try {
        if (!req.user || req.user.role !== "ADMIN_ROLE") {
            return res.status(403).json({ msg: " No tienes permisos para actualizar categorías" });
        }

        if (role && role !== "ADMIN_ROLE") {
            return res.status(400).json({
                success: false,
                msg: " No puedes cambiar el rol a otro que no sea ADMIN_ROLE"
            });
        }

       
        const categoriaGeneral = await categoriaModel.findOne({ name: "Defecto".toLowerCase() });
        if (categoriaGeneral && id === categoriaGeneral._id.toString()) {
            return res.status(400).json({
                success: false,
                msg: " No puedes editar la categoría por defecto General"
            });
        }

      
        const categoria = await categoriaModel.findByIdAndUpdate(
            id, 
            { name, description }, 
            { new: true }
        );

        if (!categoria) {
            return res.status(404).json({ msg: "Categoría no encontrada" });
        }

        res.status(200).json({ msg: " Categoría actualizada exitosamente", categoria });

    } catch (error) {
        console.error(" Error al actualizar la categoría:", error);
        res.status(500).json({ msg: " Error al actualizar la categoría", error: error.message });
    }
};



export const deleteCategory = async (req, res) => {
    
    
    try {
        const { id } = req.params;
        const autenticarCategoria = req.categoria;
        if (req.user.role !== "ADMIN_ROLE") {
            return res.status(400).json({
                success: false,
                msg: 'No tienes permisos para eliminar categorias'
            });
        }

        const categoriaGeneral = await categoriaModel.findOne({ name: "Defecto".toLowerCase() });

        if (categoriaGeneral && id === categoriaGeneral._id.toString()) {
            return res.status(400).json({
                success: false,
                msg: 'No puedes eliminar la categoría por defecto General'
            })
        }

        const categoria = await categoriaModel.findByIdAndUpdate(id, { estado: false }, { new: true });
        res.status(200).json({
            success: true,
             msg: 'Categoría eliminada exitosamente',
             categoria,
             autenticarCategoria
             });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al eliminar la categoría', error: error.message });
    }
};


export const defaultCategoria = async () => {
    try {

        const verifyCategoria = await categoriaModel.findOne({ name: "Defecto".toLowerCase() });

        if (!verifyCategoria) {
            const categoriaGeneral = new categoriaModel({
                name: "Defecto".toLowerCase(),
                description: "Categoría creada desde el inicio del sistema no se puede eliminar ni editar"
            });
    
            await categoriaGeneral.save();
    
            console.log("Categoria Defecto creada con éxito");
        } else {
            console.log("Categoria Defecto ya existe, no se volvio a crear");
        }


    } catch (error) {
        console.error("Error al crear la categoria Defecto: ", error);
    }
}