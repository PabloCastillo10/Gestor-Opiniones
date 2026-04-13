import { test, expect, vi } from "vitest";

// Mock de argon2 — evita el hash real de contraseñas en los tests
vi.mock("argon2", () => ({
    hash: vi.fn().mockResolvedValue("hashed_password"),
    verify: vi.fn().mockResolvedValue(true), // por defecto la contraseña es correcta
}));

// Mock de generate-jwt — devuelve un token falso sin firmar nada
vi.mock("../../helpers/generate-jwt.js", () => ({
    generateJWT: vi.fn().mockResolvedValue("fake-jwt-token"),
}));

// Mock de UserModel
vi.mock("../user.model.js", () => {
    const userFalso = {
        _id: "64a1f0c8e1b2c8a1b2c3d50",
        id: "64a1f0c8e1b2c8a1b2c3d50",
        name: "Test",
        surname: "User",
        username: "testuser",
        email: "testuser@gmail.com",
        password: "hashed_password",
        role: "USER",
        status: true,
    };

    function MockUserModel(data) {
        Object.assign(this, data);
    }

    // save en prototype — para poder pisarlo en tests de error
    MockUserModel.prototype.save = vi.fn().mockResolvedValue({});
    MockUserModel.findOne = vi.fn().mockResolvedValue(userFalso);
    MockUserModel.findById = vi.fn().mockResolvedValue(userFalso);

    return { default: MockUserModel };
});

import { register, login, getProfile } from "../user.controller.js";
import UserSchema from "../user.model.js";
import { verify } from "argon2";

// --- register ---

test("register - exito", async () => {
    const req = {
        body: {
            name: "Test",
            surname: "User",
            username: "testuser",
            email: "testuser@gmail.com",
            password: "password123",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await register(req, res);

    // register no llama res.status() explicitamente — solo res.json()
    expect(res.json).toHaveBeenCalledWith({
        msg: "Usuario registrado exitosamente",
        name: "Test",
        surname: "User",
        username: "testuser",
        email: "testuser@gmail.com",
    });
});

test("register - error al guardar (email o username duplicado)", async () => {
    const req = {
        body: {
            name: "Test",
            surname: "User",
            username: "testuser",
            email: "testuser@gmail.com",
            password: "password123",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // save esta en prototype — se puede pisar desde aca
    UserSchema.prototype.save.mockRejectedValueOnce(new Error("Error al guardar"));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Error en el servidor" })
    );
});

// --- login ---

test("login - exito con email y contrasena correcta", async () => {
    const req = {
        body: {
            email: "testuser@gmail.com",
            password: "password123",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await login(req, res);

    // login tampoco llama res.status() explicitamente — solo res.json()
    expect(res.json).toHaveBeenCalledWith({
        msg: "Login exitoso",
        token: "fake-jwt-token",
    });
});

test("login - usuario no encontrado", async () => {
    const req = {
        body: { email: "noexiste@gmail.com", password: "password123" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Override: findOne devuelve null = usuario no existe
    UserSchema.findOne = vi.fn().mockResolvedValueOnce(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Credenciales incorrectas - usuario no encontrado" })
    );
});

test("login - usuario desactivado", async () => {
    const req = {
        body: { email: "testuser@gmail.com", password: "password123" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Override: findOne devuelve usuario con status false
    UserSchema.findOne = vi.fn().mockResolvedValueOnce({
        _id: "64a1f0c8e1b2c8a1b2c3d50",
        email: "testuser@gmail.com",
        password: "hashed_password",
        status: false,
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Usuario desactivado - contacta al administrador" })
    );
});

test("login - contrasena incorrecta", async () => {
    const req = {
        body: { email: "testuser@gmail.com", password: "wrongpassword" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Restaurar findOne al usuario valido — el test anterior lo habia reemplazado
    UserSchema.findOne = vi.fn().mockResolvedValueOnce({
        _id: "64a1f0c8e1b2c8a1b2c3d50",
        id: "64a1f0c8e1b2c8a1b2c3d50",
        email: "testuser@gmail.com",
        password: "hashed_password",
        role: "USER",
        status: true,
    });

    // Override: verify devuelve false = contrasena no coincide
    vi.mocked(verify).mockResolvedValueOnce(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Credenciales incorrectas - contraseña incorrecta" })
    );
});

// --- getProfile ---

test("getProfile - devuelve el usuario autenticado", async () => {
    const req = {
        usuario: {
            _id: "64a1f0c8e1b2c8a1b2c3d50",
            name: "Test",
            username: "testuser",
            email: "testuser@gmail.com",
            role: "USER",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Perfil del usuario",
            user: expect.objectContaining({ username: "testuser" }),
        })
    );
});
