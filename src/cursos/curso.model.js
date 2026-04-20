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
        imagen: {
            type: String,
            default: "https://res.cloudinary.com/dr1ynt1v8/image/upload/v1776722768/5352122_e3yrmu.png",
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