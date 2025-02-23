import { Schema, model } from "mongoose";


const categoriaSchema = Schema({
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: [false],
        },
        estado: {
            type: Boolean,
            default: true,
        },
    }, {
        timestamps: true,
        versionKey: false,
    }
)

categoriaSchema.methods.toJSON = function () {
    const { __v, _id,...categoria } = this.toObject();
    categoria.uid = _id;
    return categoria;
}

export default model('Categoria', categoriaSchema);