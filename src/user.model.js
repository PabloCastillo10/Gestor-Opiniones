import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
    },
    surname: {
      type: String,
      required: [true, "El apellido es obligatorio"],
    },
    username: {
      type: String,
      required: [true, "El  usuario es obligatorio"],
      unique: [true, "El nombre de usuario ya está registrado"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: [true, "El email ya está registrado"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { 
    timestamps: true,
    versionKey: false,
  },
);

export const UserSchema = model("Usuario", userSchema);

export default UserSchema;
