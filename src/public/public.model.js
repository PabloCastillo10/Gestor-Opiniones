import { model, Schema } from "mongoose";

export const PublicSchema = Schema(
  {
    titulo: {
      type: String,
    },
    curso: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
      },
    ],
    autor: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    imagen: {
      type: String,
      default: "https://res.cloudinary.com/dr1ynt1v8/image/upload/v1776723097/7554733_sr7r0f.png",
    },
    texto: {
      type: String,
    },
    comentarios: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comentario",
      },
    ],
    fecha: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// antes del export:
PublicSchema.index({ titulo: "text", texto: "text" });

export default model("Publicacion", PublicSchema);
