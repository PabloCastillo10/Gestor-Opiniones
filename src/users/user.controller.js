import userModel from "./user.model.js";
import categoriaModel from "../categorias/categoria.model.js";
import {hash, verify} from 'argon2'
import {generarJWT} from "../helpers/generate-jwt.js"
import {response, request} from 'express'

export const login = async (req, res) => {

    const { email, password, username } = req.body;
    
    try {
        const lowerEmail = email ? email.toLowerCase() : null;    
        const lowerUsername = username ? username.toLowerCase() : null;
        
        const user = await userModel.findOne({ 
            $or: [{ email: lowerEmail }, { username: lowerUsername }] 
        });

        if (!user) {
            return res.status(404).json({ 
                msg: 'Credenciales incorrectas, correo o nombre de usuario no existe en la base de datos' 
            });
        }

        if (!user.estado) {
            return res.status(400).json({
                msg: 'El usuario no existe en la base de datos'
            });
        }

        const validPassword = await verify(user.password, password);
        
        if (!validPassword) {
            return res.status(400).json({
                msg: 'Contraseña incorrecta'
            });
        }

        const token = await generarJWT(user.id);

        return res.status(200).json({
            msg: 'Inicion de sesion exitoso pe causa',
            userDetails: {
                username: user.username,
                token: token
            }
        })

    } catch (e) {

        console.error(e);

        return res.status(500).json({
            msg: 'Server error',
            error: e.message
        })
    }
}

export const register = async (req, res) => {

    try {

        const data = req.body;

        const encryptedPassword = await hash(data.password);

        const user = await userModel.create({
            name: data.name,
            surname: data.surname,
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase(),
            phone: data.phone,
            password: encryptedPassword
        });

        res.status(200).json({
            msg: 'User registration successful',
            userDetails: {
                user: user
            }
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: 'User registration failded',
            error: error.message
        })
    }
}


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; 
        const { name, surname, username, phone, oldPassword, newPassword } = req.body;

      
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        
        if (username && username !== user.username) {
            const existingUser = await userModel.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ msg: "Username already in use" });
            }
        }
        if (req.user.id !== id && req.user.role !== "ADMIN_ROLE") {
            return res.status(400).json({
                success: false,
                msg: 'No tiene permiso para actualizar un perfil que no es suyo'
            })
        }

     
        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ msg: "Old password is required to change the password" });
            }

            const isMatch = await verify(user.password, oldPassword); 
            if (!isMatch) {
                return res.status(400).json({ msg: "Old password is incorrect" });
            }

         
            user.password = await hash(newPassword);
        }

     
        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.username = username || user.username;
        user.phone = phone || user.phone;

        await user.save();

        res.status(200).json({
            msg: "Profile updated successfully",
            userDetails: {
                name: user.name,
                surname: user.surname,
                username: user.username,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

export const createAdmin = async () => {
    try {

        const verifyUser = await userModel.findOne({ username: "Admin".toLowerCase() })

        if (!verifyUser) {
            const encryptedPassword = await hash("Admin100");
            const adminUser = new userModel({
                name: "Pablo",
                surname: "Castillo",
                username: "Admin".toLowerCase(),
                email: "pablocastillo@gmail.com",
                phone: "12345678",
                password: encryptedPassword,
                role: "ADMIN_ROLE"
            });
    
            await adminUser.save();
    
            console.log("Usuario ADMIN creado con éxito");
        } else {
            console.log("Usuario ADMIN ya existe, no se volvio a crear");
        }

    
    } catch (error) {
        console.error("Error al crear el usuario ADMIN: ", error);
    }
}
