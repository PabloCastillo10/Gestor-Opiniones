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

PublicSchema.methods.toJSON = function () {
    const { __v, _id,...publicacion } = this.toObject();
    publicacion.uid = _id;
    return publicacion;
}

export default  model('Publicacion', PublicSchema);