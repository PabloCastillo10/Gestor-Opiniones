import { Schema, model } from "mongoose";


const cursoSchema = Schema({
        cursoName: {
            type: String,
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



export default model('Curso', cursoSchema);