import publicModel from "./public.model.js";
import { request, response } from "express";
import cursoModel from "../cursos/curso.model.js";
import { validateTitulo } from "../helpers/db-validator-publicacion.js";
import { uploadImageToCloudinary } from "../middlewares/cloudinary.js";

export const savePublicacion = async (req, res) => {
  const data = req.body || {};
  const autor = req.usuario;
  try {
    const curso = await cursoModel.findOne({ cursoName: data.curso });
    if (!curso) {
      return res.status(400).json({
        succes: false,
        msg: `Curso "${data.curso}" no encontrado`,
      });
    }

    const fechaFinal = data.fecha ? new Date(data.fecha) : new Date();
    let imagen;
    if (req.file) {
      imagen = await uploadImageToCloudinary(req.file.buffer);
    } else if (req.body.imagen) {
      imagen = req.body.imagen;
    }
    data.imagen = imagen;

    await validateTitulo(data.titulo);

    const publicacion = new publicModel({

      ...data,
      curso: curso._id,
      fecha: fechaFinal,
      autor: autor._id,
    });

    await publicacion.save();

    const publicacionGuardada = await publicModel
      .findById(publicacion._id)
      .populate("curso", "cursoName")
      .populate("autor", "username");
    return res.status(201).json({
      succes: true,
      msg: "Publicación Guardada Correctamente",
      publicacion: publicacionGuardada,
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      msg: "Error al guardar la publicación",
      error: error.message,
    });
  }
};

export const getPublicaciones = async (req = request, res = response) => {
  try {
    //Añadir paginacion
    const { page = 1, limit = 10, search } = req.query; //Valor por defecto para page y limit
    const skip = (page - 1) * limit; //Calcular el número de documentos a omitir
    const query = search
      ? { $text: { $search: search }, status: true }
      : { status: true };
    const paginatedPublicaciones = await publicModel
      .find(query)
      .populate("curso", "cursoName")
      .populate("autor", "username")
      .populate("likes", "username") // Popula los likes con el nombre de usuario
      .populate({
        path: "comentarios",
        match: { status: true },
      })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      succes: true,
      msg: "Publicaciones Obtenidas Correctamente",
      publicaciones: paginatedPublicaciones,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      msg: "Error al obtener las publicaciones",
      error: error.message,
    });
  }
};

//Buscar publicaciones por id

export const getPublicacionById = async (req = request, res = response) => {
  const { id } = req.params;

  try {
    const publicacion = await publicModel
      .findById(id)
      .populate("curso", "cursoName")
      .populate("autor", "username");

    if (!publicacion) {
      return res.status(404).json({
        succes: false,
        msg: "Publicación no encontrada",
      });
    }

    res.status(200).json({
      succes: true,
      msg: "Publicación Obtenida Correctamente",
      publicacion,
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      msg: "Error al obtener la publicación",
      error: error.message,
    });
  }
};

//Buscar publicaciones por curso

export const getPublicacionesByCurso = async (
  req = request,
  res = response,
) => {
  const { cursoName } = req.params;

  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const curso = await cursoModel.findOne({ cursoName });
    if (!curso) {
      return res.status(404).json({
        succes: false,
        msg: `Curso "${cursoName}" no encontrado`,
      });
    }

    const publicaciones = await publicModel
      .find({ curso: curso._id, status: true })
      .populate("curso", "cursoName")
      .populate("autor", "username")
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      succes: true,
      msg: "Publicaciones Obtenidas Correctamente",
      publicaciones,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      msg: "Error al obtener las publicaciones",
      error: error.message,
    });
  }
};

export const updatePublicacion = async (req, res) => {
  const { id } = req.params;
  const { titulo, texto, imagen } = req.body;

  try {
    const publicacion = await publicModel.findOne({ _id: id, status: true });

    if (!publicacion) {
      return res.status(404).json({ msg: "Publicación no encontrada" });
    }

    //Si es ADMIN pueda actualizar cualquier publicación, si es USER solo pueda actualizar sus publicaciones
    if (
      req.usuario.role === "USER" &&
      !publicacion.autor.equals(req.usuario._id)
    ) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para actualizar esta publicación" });
    }

    //Validar que el nuevo título no exista en otra publicación
    if (titulo && titulo !== publicacion.titulo) {
      await validateTitulo(titulo);
      publicacion.titulo = titulo;
    }

    //Actualizar el texto si se proporciona
    if (texto) {
      publicacion.texto = texto;
    }

    //Actualizar la imagen si se proporciona
    if (imagen) {
      publicacion.imagen = imagen;
    } else if (req.file) {
      const imagenUrl = await uploadImageToCloudinary(req.file.buffer);
      publicacion.imagen = imagenUrl;
    }

    await publicacion.save();

    const publicacionActualizada = await publicModel
      .findById(publicacion._id)
      .populate("curso", "cursoName")
      .populate("autor", "username");

    res.status(200).json({
      msg: "Publicación actualizada correctamente",
      publicacion: publicacionActualizada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al actualizar la publicación",
      error: error.message,
    });
  }
};

export const deletePublicacion = async (req, res) => {
  const { id } = req.params;

  try {
    const publicacion = await publicModel.findOne({ _id: id, status: true });

    if (!publicacion) {
      return res.status(404).json({ msg: "Publicación no encontrada" });
    }

    //Si es ADMIN pueda eliminar cualquier publicación, si es USER solo pueda eliminar sus publicaciones
    if (
      req.usuario.role === "USER" &&
      !publicacion.autor.equals(req.usuario._id)
    ) {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para eliminar esta publicación" });
    }

    publicacion.status = false;
    await publicacion.save();

    res.status(200).json({ msg: "Publicación eliminada exitosamente" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "Error al eliminar la publicación", error: error.message });
  }
};

//Agregar like a la publicacion, si el usuario ya le dio like, quitar el like (toggle)
export const toggleLikePublicacion = async (req, res) => {
  const { id } = req.params;

  try {
    const publicacion = await publicModel.findOne({ _id: id, status: true });

    if (!publicacion) {
      return res.status(404).json({ msg: "Publicación no encontrada" });
    }

    const usuarioId = req.usuario._id;
    const yaleDioLike = publicacion.likes.some((like) =>
      like.equals(usuarioId),
    ); //.some para verificar si el usuario ya le dio like a la publicación

    if (yaleDioLike) {
      // Si ya le dio like, quitar el like
      await publicModel.findByIdAndUpdate(id, { $pull: { likes: usuarioId } }); // $pull para quitar el like del array
      return res.status(200).json({
        msg: "Like quitado de la publicación",
        likes: publicacion.likes.length - 1,
      });
    } else {
      // Si no le ha dado like, agregar el like
      await publicModel.findByIdAndUpdate(id, {
        $addToSet: { likes: usuarioId },
      }); // $addToSet para agregar el like al array sin duplicados
      return res.status(200).json({
        msg: "Like agregado a la publicación",
        likes: publicacion.likes.length + 1,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al procesar el like a la publicación",
      error: error.message,
    });
  }
};
