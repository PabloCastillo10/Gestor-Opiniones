import { request, response } from "express";


export const validarAdmin = async (req = request, res = response, next) => {
    const authenticatedUser  = req.usuario;
    if (!authenticatedUser) {
        return res.status(401).json({
            msg: "Usuario no autenticado",
        });
    }
    if (authenticatedUser.role !== "ADMIN") {
      return res.status(403).json({
        msg: "Acceso denegado - se requiere rol ADMIN",
      });
    }
    next();
};