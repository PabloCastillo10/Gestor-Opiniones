import { expect, test, vi } from "vitest";

// vi.mock reemplaza el modelo real de Mongoose por uno falso
// Esto evita que los tests necesiten una conexion real a MongoDB
vi.mock("../curso.model.js", () => {
    // Datos falsos que simula lo que devolveria la DB
    const cursosFalsos = [
        { _id: "1", cursoName: "Taller", description: "Curso de taller", estado: true },
        { _id: "2", cursoName: "Practica", description: "Curso de practica", estado: true },
    ];

    // Mock de la cadena .find().skip().limit() que usa getCursos
    const mockQuery = {
        skip: vi.fn().mockReturnThis(),        // .skip() devuelve la misma cadena
        limit: vi.fn().mockResolvedValue(cursosFalsos), // .limit() devuelve los datos falsos
    };

    // Mock del constructor new cursoModel({ ... })
    function MockCursoModel(data) {
        Object.assign(this, data);
        this.save = vi.fn().mockResolvedValue(this); // .save() resuelve sin error
    }

    MockCursoModel.find = vi.fn().mockReturnValue(mockQuery);
    MockCursoModel.findOne = vi.fn().mockResolvedValue(null); // null = curso no existe todavia

    return { default: MockCursoModel };
});

import { getCursos, createCurso } from "../curso.controller.js";

// --- TEST 1: getCursos ---
test("getCursos should return a list of cursos", async () => {
    // Simulamos el req y res de Express con vi.fn()
    const req = { query: { page: 1, limit: 10 } };
    const res = {
        status: vi.fn().mockReturnThis(), // .status() devuelve res para poder encadenar .json()
        json: vi.fn(),
    };

    await getCursos(req, res);

    // Verificamos que se llamo con los valores correctos
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Cursos obtenidos correctamente",
            cursos: expect.any(Array),
            page: 1,
            limit: 10,
        })
    );
});

// --- TEST 2: createCurso - caso exitoso ---
test("createCurso should create a new curso", async () => {
    const req = {
        body: {
            cursoName: "Curso de Prueba",
            description: "Descripcion del curso de prueba",
        },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await createCurso(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
            msg: "Curso creado exitosamente",
            curso: expect.objectContaining({
                cursoName: "Curso de Prueba",
            }),
        })
    );
});

// --- TEST 3: createCurso - curso ya existe ---
test("createCurso should return 400 if curso already exists", async () => {
    // Sobreescribimos el mock para este test: findOne devuelve un curso existente
    const { default: cursoModel } = await import("../curso.model.js");
    cursoModel.findOne = vi.fn().mockResolvedValue({ cursoName: "Curso de Prueba" });

    const req = {
        body: { cursoName: "Curso de Prueba", description: "Ya existe" },
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    await createCurso(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ msg: "El curso ya existe" })
    );
});