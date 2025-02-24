import jwt from 'jsonwebtoken';
import userModel from '../users/user.model.js';
import categoriaModel from '../categorias/categoria.model.js';



export const validarUserJWT = async (req, res, next) => {
    const token = req.header("x-token");
    
    if (!token) {
        return res.status(400).json({
            msg: "No hay token en la petición"
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const user = await userModel.findById(uid);

        if (!user) {
            return res.status(401).json({ msg: "Token no válido - usuario no existe" });
        }
        
        if (user.estado === false) {
            return res.status(401).json({ msg: "Token no válido - usuario inactivo" });
        }
        

        req.user = user;
        next();  
    } catch (error) {
        return res.status(401).json({
            msg: "Token no válido",
            error: error.message,
        });
    }
};


