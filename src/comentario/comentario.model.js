import { Schema, model } from "mongoose";

export const ComentarioSchema = Schema({
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: 'Publicacion',
        required: true
    },
    user: {
        type : Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    texto: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },

    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Comentario', ComentarioSchema);
