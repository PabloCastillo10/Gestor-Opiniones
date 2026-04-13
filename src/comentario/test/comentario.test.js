import { test, expect, vi } from "vitest";

// path correcto: comentario.controller.js importa desde "../public/public.model.js"
// desde el test en src/comentario/test/ el path es ../../public/public.model.js
vi.mock("../../public/public.model.js", () => {
    const publicacionFalsa = {
        _id: "64a1f0c8e1b2c8a1b2c3d4e",
        titulo: "Publicacion de Prueba",
        curso: { _id: "64a1f0c8e1b2c8a1b2c3d4f", cursoName: "Tecnologia" },
        autor: { _id: "64a1f0c8e1b2c8a1b2c3d50", username: "testuser" },
        texto: "Texto de prueba",
        status: true,
        comentarios: [],                          // el controller hace comentarios.push()
        save: vi.fn().mockResolvedValue(true),    // el controller guarda la publicacion
    };

    function MockPublicModel(data) {
        Object.assign(this, data);
    }

    // findOne sin cadena — el controller solo hace await publicModel.findOne(...)
    MockPublicModel.findOne = vi.fn().mockResolvedValue(publicacionFalsa);

    return { default: MockPublicModel };
});

// Mock de ComentarioModel
vi.mock("../comentario.model.js", () => {
    const comentarioGuardado = {
        _id: "64a1f0c8e1b2c8a1b2c3d4d",
        texto: "Excelente publicacion, muy util",
        fecha: new Date("2026-04-10"),
        user: { _id: "64a1f0c8e1b2c8a1b2c3d50", username: "testuser" },
        publicacion: { _id: "64a1f0c8e1b2c8a1b2c3d4e", titulo: "Publicacion de Prueba" },
        status: true,
    };

    function MockComentarioModel(data) {
        Object.assign(this, data);
    }

    MockComentarioModel.prototype.save = vi.fn().mockResolvedValue({});

    // findById necesita cadena .populate().populate() igual que el controller
    MockComentarioModel.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(comentarioGuardado),
        }),
    });

    MockComentarioModel.findOne = vi.fn().mockResolvedValue({
        _id: "64a1f0c8e1b2c8a1b2c3d4d",
        texto: "Excelente publicacion",
        status: true,
        user: "64a1f0c8e1b2c8a1b2c3d50",
        save: vi.fn().mockResolvedValue(true),
    });

    return { default: MockComentarioModel };
});

import { saveComentario, updateComentario, deleteComentario } from "../comentario.controller.js";
import publicModel from "../../public/public.model.js";
import comentarioModel from "../comentario.model.js";

// --- saveComentario ---

test("saveComentario - exito", async () => {
    const req = {
        body: {
            texto: "Excelente publicacion, muy util",
            fecha: "2026-04-10",
        },
        params: { titulo: "Publicacion de Prueba" },
        usuario: {
            _id: "64a1f0c8e1b2c8a1b2c3d50",
            username: "testuser",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await saveComentario(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Comentario agregado correctamente",
            success: true,
            comentario: expect.objectContaining({
                texto: "Excelente publicacion, muy util",
                user: expect.objectContaining({ username: "testuser" }),
            }),
        })
    );
});

test("saveComentario - publicacion no encontrada", async () => {
    const req = {
        body: { texto: "Comentario", fecha: "2026-04-10" },
        params: { titulo: "Titulo Inexistente" },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50", username: "testuser" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Override: findOne devuelve null para simular que no existe
    publicModel.findOne = vi.fn().mockResolvedValueOnce(null);

    await saveComentario(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Publicación no encontrada" })
    );
});

// --- updateComentario ---

test("updateComentario - exito (dueno del comentario)", async () => {
    const req = {
        params: { id: "64a1f0c8e1b2c8a1b2c3d4d" },
        body: { texto: "Texto actualizado" },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await updateComentario(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Comentario actualizado correctamente" })
    );
});

test("updateComentario - comentario no encontrado", async () => {
    const req = {
        params: { id: "id-inexistente" },
        body: { texto: "Texto" },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    const { default: comentarioModel } = await import("../comentario.model.js");
    comentarioModel.findOne = vi.fn().mockResolvedValueOnce(null);

    await updateComentario(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Comentario no encontrado" })
    );
});

// --- deleteComentario ---

test("deleteComentario - exito", async () => {
    const req = {
        params: { id: "64a1f0c8e1b2c8a1b2c3d4d" },
        usuario: { _id: "64a1f0c8e1b2c8a1b2c3d50" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Restaurar findOne — el test anterior lo reemplazo con null
    comentarioModel.findOne = vi.fn().mockResolvedValueOnce({
        _id: "64a1f0c8e1b2c8a1b2c3d4d",
        texto: "Excelente publicacion",
        status: true,
        user: "64a1f0c8e1b2c8a1b2c3d50",
        save: vi.fn().mockResolvedValue(true),
    });

    await deleteComentario(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "Comentario eliminado correctamente" })
    );
});

test("deleteComentario - sin permiso (otro usuario)", async () => {
    const req = {
        params: { id: "64a1f0c8e1b2c8a1b2c3d4d" },
        usuario: { _id: "otro-usuario-id" }, // ID diferente al dueno
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    // Restaurar findOne con el dueno original
    comentarioModel.findOne = vi.fn().mockResolvedValueOnce({
        _id: "64a1f0c8e1b2c8a1b2c3d4d",
        texto: "Excelente publicacion",
        status: true,
        user: "64a1f0c8e1b2c8a1b2c3d50", // dueno del comentario
        save: vi.fn().mockResolvedValue(true),
    });

    await deleteComentario(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "No tienes permiso para eliminar este comentario" })
    );
});
