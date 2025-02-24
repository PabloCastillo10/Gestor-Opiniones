import { Schema, model } from "mongoose";

export const ComentarioSchema = Schema({
    publicacion: {
        type: Schema.Types.ObjectId,
        ref: 'Publicacion',
        required: true
    },
    user: {
        type:Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    texto: {
        type: String,
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
