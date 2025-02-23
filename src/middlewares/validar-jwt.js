import jwt from 'jsonwebtoken';
import userModel from '../users/user.model.js';



export const validarUserJWT = async (req, res, next) => {

    const token = req.header("x-token");
    
    if (!token) {
        return res.status(400).json({
            msg: "No hay token en la petición"
        });
    }

    try {
        const {uid} = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        const user = await userModel.findById(uid);

        if (!user) {
            return res.status(400).json({ msg: "Token no valido - usuario no existe" });
        }

        if (user.estado === false) {
            return res.status(400).json({ msg: "Token no valido - usuario inactivo" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Token no valido" });
    }
}

export const validarAdminJWT = async (req, res, next) => {
    const token = req.header("x-token");
    
    if (!token) {
        return res.status(400).json({ msg: "No hay token en la peticion" });
    }

    try {
        const {uid} = jwt.verify(token, process.env.SECRETOPRIVATEKEY);

        const admin = await Admin.findById(uid);

        if (!admin) {
            return res.status(400).json({ msg: "Token no valido - admin no existe" });
        }

        if (!admin.estado) {
            return res.status(400).json({ msg: "Token no valido - admin inactivo" });
        }
        
        req.admin = admin;
        next();
    } catch (e) {
        console.log(e);
        res.status(400).json({ msg: "Token no valido" });
    }
}