import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = (buffer, folder = 'gestor-opiniones') => {
    return new Promise((resolve, reject) => { // Convertir el buffer a un stream y subirlo a Cloudinary
        const stream = cloudinary.uploader.upload_stream( 
            { folder }, // Opcional: puedes organizar las imágenes en carpetas dentro de tu cuenta de Cloudinary
            (error, result) => { // Callback que se ejecuta después de intentar subir la imagen
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        stream.end(buffer); // Finalizar el stream con el buffer de la imagen para iniciar la subida
    });
};