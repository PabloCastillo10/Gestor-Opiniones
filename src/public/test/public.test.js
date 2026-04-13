import { test, expect, vi } from "vitest";

// Mock de validateTitulo — evita que llame a publicModel internamente
vi.mock("../../helpers/db-validator-publicacion.js", () => ({
    validateTitulo: vi.fn().mockResolvedValue(undefined),
}));

// Mock de cursoModel — requerido por savePublicacion
vi.mock("../../cursos/curso.model.js", () => {
    const MockCursoModel = vi.fn();
    MockCursoModel.findOne = vi.fn().mockResolvedValue({
        _id: "64a1f0c8e1b2c8a1b2c3d4f",
        cursoName: "Tecnologia",
    });
    return { default: MockCursoModel };
});

// Mock de publicModel
vi.mock("../public.model.js", () => {
    const publicacionFalsa = {
        _id: "64a1f0c8e1b2c8a1b2c3d4e",
        titulo: "Publicacion de Prueba",
        curso: { _id: "64a1f0c8e1b2c8a1b2c3d4f", cursoName: "Tecnologia" },
        autor: {
            _id: "64a1f0c8e1b2c8a1b2c3d50",
            username: "testuser",
            equals: vi.fn().mockReturnValue(true), // simula que el autor coincide
        },
        texto: "Texto de prueba",
        status: true,
    };

    // Chain para find().populate().populate().populate().skip().limit()
    // populate() debe estar en la cadena porque el controller lo llama 3 veces
    const mockFindChain = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([publicacionFalsa]),
    };

    // Chain para findById().populate().populate()
    const mockFindByIdChain = {
        populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(publicacionFalsa),
        }),
    };

    function MockPublicModel(data) {
        Object.assign(this, data);
        // save en prototype para poder pisarlo desde los tests de error
    }

    // save en prototype — asi se puede hacer mockRejectedValue en tests de error
    MockPublicModel.prototype.save = vi.fn().mockResolvedValue({});
    MockPublicModel.find = vi.fn().mockReturnValue(mockFindChain);
    MockPublicModel.findOne = vi.fn().mockResolvedValue(publicacionFalsa);
    MockPublicModel.findById = vi.fn().mockReturnValue(mockFindByIdChain);

    return { default: MockPublicModel };
});

import { getPublicaciones, savePublicacion, updatePublicacion } from "../public.controller.js";
import publicModel from "../public.model.js";

// --- TEST 1: getPublicaciones exitoso ---
test("getPublicaciones should return a list of publicaciones", async () => {
    const req = { query: { page: 1, limit: 10 } };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await getPublicaciones(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Publicaciones Obtenidas Correctamente", // coincide exacto con el controller
            publicaciones: expect.any(Array),
            page: 1,
            limit: 10,
        })
    );
});

// --- TEST 2: getPublicaciones con error ---
test("getPublicaciones should handle errors", async () => {
    const req = { query: { page: 1, limit: 10 } };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // El error debe ocurrir al final de la cadena (en limit), no en find
    const errorMessage = "Error de base de datos";
    publicModel.find.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error(errorMessage)),
    });

    await getPublicaciones(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Error al obtener las publicaciones",
        })
    );
});

// --- TEST 3: savePublicacion exitoso ---
test("savePublicacion should create a new publicacion", async () => {
    const req = {
        body: {
            titulo: "Publicacion de Prueba",
            curso: "Tecnologia",   // cursoName, no ID
            texto: "Texto de prueba.",
        },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50" }, // autor viene del token
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await savePublicacion(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Publicación Guardada Correctamente", // coincide exacto con el controller
        })
    );
});

// --- TEST 4: savePublicacion con error en save ---
test("savePublicacion should handle save errors", async () => {
    const req = {
        body: {
            titulo: "Publicacion de Prueba",
            curso: "Tecnologia",
            texto: "Texto de prueba.",
        },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Ahora si funciona porque save esta en el prototype
    publicModel.prototype.save.mockRejectedValue(new Error("Error al guardar"));

    await savePublicacion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Error al guardar la publicación",
        })
    );
});

// --- TEST 5: updatePublicacion exitoso ---
test("updatePublicacion should update an existing publicacion", async () => {
    const req = {
        params: { id: "64a1f0c8e1b2c8a1b2c3d4e" },
        body: {
            titulo: "Titulo Actualizado",
            texto: "Texto actualizado.",
        },
        usuario: {
            _id: "64a1f0c8e1b2c8a1b2c3d50",
            role: "USER",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // findOne devuelve publicacion con save en el objeto
    publicModel.findOne = vi.fn().mockResolvedValue({
        _id: "64a1f0c8e1b2c8a1b2c3d4e",
        titulo: "Titulo Original",
        texto: "Texto original",
        autor: {
            equals: vi.fn().mockReturnValue(true),
        },
        status: true,
        save: vi.fn().mockResolvedValue(true),
    });

    await updatePublicacion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Publicación actualizada correctamente",
        })
    );
});

// --- TEST 6: updatePublicacion con error ---
test("updatePublicacion should handle errors", async () => {
    const req = {
        params: { id: "64a1f0c8e1b2c8a1b2c3d4e" },
        body: { titulo: "Titulo", texto: "Texto" },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50", role: "USER" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    publicModel.findOne = vi.fn().mockRejectedValue(new Error("Error de DB"));

    await updatePublicacion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Error al actualizar la publicación",
        })
    );
});
