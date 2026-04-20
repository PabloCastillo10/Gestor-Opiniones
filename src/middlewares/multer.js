import multer from "multer";

const MIMTYPES = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
}

const MAX_SIZE = 5 * 1024 * 1024; //? 5MB

const storage = multer.memoryStorage(); //? Almacenar el archivo en memoria

const fileFilter = (req, file, cb) => {
    if (MIMTYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error("Archivo no permitido"), false);
    }
} //? Función para validar el tipo de archivo, solo se permiten imágenes PNG y JPEG

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_SIZE,
    },
}); //? Configuración de multer para manejar la subida de archivos, con validación de tipo y tamaño.

export default upload;