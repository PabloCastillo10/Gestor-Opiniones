import { model, Schema } from "mongoose";

export const PublicSchema = Schema ({
            titulo: {
                type: String,
                required: true
            },
            categoria: {
                type: Schema.Types.ObjectId,
                ref: 'Categoria',
                required: true
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            textoPrincipal: {
                type: String,
                required: true
            },
            comentarios: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'Comentario',
                }
            ],
            status: {
                type: Boolean,
                default: true
            },

        },
    {
            timestamps: true,
            versionKey: false
    }
)


export default  model('Publicacion', PublicSchema);