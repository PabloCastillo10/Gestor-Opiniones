import { model, Schema } from "mongoose";

export const PublicSchema = Schema ({
            titulo: {
                type: String,

            },
            curso: {
                type: Schema.Types.ObjectId,
                ref: 'Curso',
            },
            autor: {
                type: String,

            },
            texto: {
                type: String,

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