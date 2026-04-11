import UserSchema from "./user.model.js";
import { hash, verify} from "argon2";
import { generateJWT } from "./helpers/generate-jwt.js";
import { response, request } from "express";

export const login = async (req = request, res = response) => {
  const { email, password, username } = req.body;

  try {
    const lowerUsername = username ? username.toLowerCase() : null;
    const lowerEmail = email ? email.toLowerCase() : null;

    const user = await UserSchema.findOne({
      $or: [{ email: lowerEmail }, { username: lowerUsername }],
    });

    if (!user) {
      return res.status(400).json({
        msg: "Credenciales incorrectas - usuario no encontrado",
      });
    }

    if (!user.status) {
      return res.status(403).json({
        msg: "Usuario desactivado - contacta al administrador",
      });
    }

    const isMatch = await verify(user.password, password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Credenciales incorrectas - contraseña incorrecta",
      });
    }

    const token = await generateJWT(user.id);

    res.json({
      msg: "Login exitoso",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message,
    });
  }
};

export const register = async (req = request, res = response) => {
  try {
    const data = req.body;

    const encryptedPassword = await hash(data.password);

    const user = new UserSchema({
      name: data.name,
      surname: data.surname,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      password: encryptedPassword,
    });

    await user.save();

    res.json({
      msg: "Usuario registrado exitosamente",
      name: data.name,
      surname: data.surname,
      username: data.username,
      email: data.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message,
    });
  }
};

//Lista de usuarios solo para role ADMIN
export const listUsers = async (req = request, res = response) => {
  try {
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    const users = await UserSchema.find({status: true}).select("-password") // Excluye el campo de contraseña
    .skip(skip)
    .limit(parseInt(limit));
    res.json({
      msg: "Lista de usuarios",
      users,
        page: parseInt(page),
        limit: parseInt(limit)
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message,
    });
  }
};

//Obtener perfil del usuario autenticado
export const getProfile = async (req = request, res = response) => {
  try {
    const user = req.usuario;
    res.json({
      msg: "Perfil del usuario",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message
    });
  }
};

//Crear usuario ADMIN por defecto al iniciar el servidor
export const createAdminUser = async () => {
  try {
    const verifyAdmin = await UserSchema.findOne({ email: "admin@gmail.com" });
    if (!verifyAdmin) {
      const adminUser = new UserSchema({
        name: "Admin",
        surname: "User",
        username: "admin",
        email: "admin@gmail.com",
        password: await hash(process.env.AdminPassword || "admin123"),
        role: "ADMIN",
      });
      await adminUser.save();
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

//Funcion de editar perfil de usuario
export const editProfile = async (req = request, res = response) => {
  try {
    const userId = req.usuario._id;
    const { name, surname, username, email, password } = req.body;

    const updateData = {}; // Objeto para almacenar los campos a actualizar
    if (name) updateData.name = name;
    if (surname) updateData.surname = surname;
    if (username) updateData.username = username.toLowerCase();
    if (email) updateData.email = email.toLowerCase();
    if (password) updateData.password = await hash(password);

    const updatedUser = await UserSchema.findByIdAndUpdate(
      userId,
      { $set: updateData }, //$set para actualizar solo los campos proporcionados
      { new: true } // Devuelve el documento actualizado
    ).select("-password"); // Excluye el campo de contraseña

    res.json({
      msg: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    // código 11000 es el error de clave duplicada de MongoDB
    if (error.code === 11000) {
        const campo = Object.keys(error.keyValue)[0];
        return res.status(400).json({
            msg: `El ${campo} "${error.keyValue[campo]}" ya está en uso`,
        });
    }
    res.status(500).json({ msg: "Error en el servidor", error: error.message });
}
}


//Funcion para Administrador cambiar status de usuario (activar/desactivar)
export const toggleUserStatus = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    const user = await UserSchema.findById(id);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    user.status = !user.status; // Cambia el status a su valor opuesto
    await user.save();

    res.json({
      msg: `Usuario ${user.status ? "activado" : "desactivado"} exitosamente`,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  }  catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error en el servidor",
      error: error.message,
    });
  }
}