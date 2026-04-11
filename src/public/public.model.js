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
