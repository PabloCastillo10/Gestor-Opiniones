# Gestor Opiniones — Documentación de Arquitectura

## Descripción general

API REST construida con Node.js y Express para gestionar un sistema de publicaciones por curso. Los usuarios pueden registrarse, crear publicaciones dentro de un curso, comentar en ellas y dar likes. Existe un rol administrador con permisos extendidos para gestionar usuarios y cursos.

---

## Estructura del proyecto

```
Gestor-Opiniones/
├── index.js                          # Punto de entrada — instancia y arranca el servidor
├── package.json
├── configs/
│   ├── server.js                     # Clase Server: middlewares, rutas, arranque
│   ├── mongo.js                      # Conexión a MongoDB con eventos de estado
│   ├── swagger.js                    # Configuración de Swagger/OpenAPI 3.0
│   └── collections/                  # Colecciones de Postman exportadas
│       ├── Blog.postman_collection.json
│       └── gestor-opinion.postman_collection.json
└── src/
    ├── user/
    │   ├── user.model.js
    │   ├── user.controller.js
    │   ├── user.routes.js
    │   └── test/user.test.js
    ├── cursos/
    │   ├── curso.model.js
    │   ├── curso.controller.js
    │   ├── curso.routes.js
    │   └── test/curso.test.js
    ├── public/
    │   ├── public.model.js
    │   ├── public.controller.js
    │   ├── public.routes.js
    │   └── test/public.test.js
    ├── comentario/
    │   ├── comentario.model.js
    │   ├── comentario.controller.js
    │   ├── comentario.routes.js
    │   └── test/comentario.test.js
    ├── helpers/
    │   ├── generate-jwt.js
    │   ├── db-validator-publicacion.js
    │   └── db-validator-comentario.js
    └── middlewares/
        ├── validar-jwt.js
        ├── validar-campos.js
        ├── validate-admin.js
        ├── validar-cant-peticiones.js
        ├── validator.js
        └── delete-file.on-error.js
```

---

## Librerías utilizadas

### Producción

| Librería | Versión | Uso |
|---|---|---|
| `express` | ^4.21.2 | Framework web principal |
| `mongoose` | ^8.10.1 | ODM para MongoDB |
| `jsonwebtoken` | ^9.0.2 | Generación y verificación de JWT |
| `argon2` | ^0.41.1 | Hash de contraseñas (algoritmo principal) |
| `bcryptjs` | ^3.0.2 | Hash de contraseñas (incluido, no usado activamente) |
| `cors` | ^2.8.5 | Habilitar CORS en todas las rutas |
| `dotenv` | ^16.4.7 | Variables de entorno desde `.env` |
| `helmet` | ^8.0.0 | Headers de seguridad HTTP |
| `morgan` | ^1.10.0 | Logger de peticiones HTTP |
| `multer` | ^1.4.5-lts.1 | Manejo de archivos subidos |
| `express-validator` | ^7.2.1 | Validación y sanitización de inputs |
| `swagger-jsdoc` | ^6.2.8 | Generación de spec OpenAPI desde JSDoc |
| `swagger-ui-express` | ^5.0.1 | Interfaz web de Swagger |

### Desarrollo

| Librería | Versión | Uso |
|---|---|---|
| `nodemon` | ^3.1.9 | Reinicio automático en desarrollo |
| `vitest` | ^4.1.4 | Framework de testing unitario |

---

## Patrón de arquitectura — MVC modular

El proyecto implementa **MVC (Model-View-Controller)** organizado por módulos. Cada entidad de negocio tiene su propia carpeta con modelo, controlador, rutas y tests.

```
src/<modulo>/
├── <modulo>.model.js       → Esquema y modelo de Mongoose
├── <modulo>.controller.js  → Lógica de negocio
├── <modulo>.routes.js      → Definición de rutas y middlewares de la ruta
└── test/<modulo>.test.js   → Tests unitarios con mocks
```

No hay capa de "View" porque es una API REST — el JSON es la respuesta.

### Flujo de una petición

```
Petición HTTP
    └── Express Router (routes.js)
            └── Middleware chain (validarJWT → validarAdmin → validarCampos)
                    └── Controller (lógica de negocio)
                            └── Model (acceso a MongoDB)
                                    └── Respuesta JSON
```

---

## Módulos

### Usuario (`src/user/`)

Gestión de autenticación y cuentas.

**Modelo:**
```
name | surname | username (único) | email (único) | password (hash argon2)
role: "USER" | "ADMIN"
status: Boolean (soft disable)
```

**Endpoints principales:**
```
POST /gestorOpinion/users/register       — Registro público
POST /gestorOpinion/users/login          — Login, devuelve JWT
GET  /gestorOpinion/users/profile        — Perfil propio (auth)
PUT  /gestorOpinion/users/profile        — Editar perfil (auth)
GET  /gestorOpinion/users/users          — Listar usuarios (ADMIN)
PUT  /gestorOpinion/users/toggle-status/:id — Activar/desactivar usuario (ADMIN)
```

### Cursos (`src/cursos/`)

Categorías donde se agrupan las publicaciones.

**Modelo:**
```
cursoName (único) | description | estado: Boolean (soft delete)
```

**Endpoints:**
```
GET  /gestorOpinion/cursos/              — Listar cursos activos (paginado)
POST /gestorOpinion/cursos/create        — Crear curso (ADMIN)
PUT  /gestorOpinion/cursos/update/:id    — Editar curso (ADMIN)
DELETE /gestorOpinion/cursos/delete/:id  — Soft delete (ADMIN)
```

### Publicaciones (`src/public/`)

Contenido principal del sistema.

**Modelo:**
```
titulo (único) | texto | fecha | status: Boolean
autor → ref Usuario
curso  → ref Curso
likes  → [ref Usuario]
comentarios → [ref Comentario]
```

**Endpoints:**
```
GET  /gestorOpinion/publicaciones/           — Listar (paginado, búsqueda full-text)
POST /gestorOpinion/publicaciones/           — Crear publicación (auth)
GET  /gestorOpinion/publicaciones/:id        — Obtener por ID
GET  /gestorOpinion/publicaciones/curso/:cursoName — Filtrar por curso
PUT  /gestorOpinion/publicaciones/:id        — Editar (dueño o ADMIN)
DELETE /gestorOpinion/publicaciones/:id      — Soft delete (dueño o ADMIN)
POST /gestorOpinion/publicaciones/:id/like   — Toggle like (auth)
```

### Comentarios (`src/comentario/`)

Respuestas asociadas a una publicación.

**Modelo:**
```
texto | fecha | status: Boolean
publicacion → ref Publicacion
user        → ref Usuario
```

**Endpoints:**
```
POST   /gestorOpinion/comentarios/:titulo — Comentar en una publicación (auth)
PUT    /gestorOpinion/comentarios/:id     — Editar comentario (solo dueño)
DELETE /gestorOpinion/comentarios/:id     — Soft delete (solo dueño)
```

---

## Middlewares

| Archivo | Función |
|---|---|
| `validar-jwt.js` | Extrae Bearer token del header `Authorization`, verifica con JWT, adjunta el usuario a `req.usuario` |
| `validate-admin.js` | Verifica que `req.usuario.role === "ADMIN"`, responde 403 si no |
| `validar-campos.js` | Lee errores de `express-validator` y los retorna en 400 si los hay |
| `validar-cant-peticiones.js` | Rate limiting: máx. 100 peticiones por IP en ventana de 15 minutos |
| `validator.js` | Cadenas de validación reutilizables para register, login y categorías |
| `delete-file.on-error.js` | Elimina archivos subidos con `multer` si la validación falla |

### Cadena típica de middlewares por ruta

```js
// Ruta pública
router.get("/", getPublicaciones);

// Ruta autenticada
router.post("/", validarJWT, savePublicacion);

// Ruta solo para administradores
router.post("/create", validarJWT, validarAdmin, createCurso);

// Ruta con validación de inputs
router.post("/register", [...validaciones], validarCampos, register);
```

---

## Autenticación

- Basada en **JWT (JSON Web Tokens)** sin estado (stateless)
- Tokens con expiración de **1 hora**
- Se envía en header: `Authorization: Bearer <token>`
- El middleware `validar-jwt.js` verifica el token y consulta la base de datos para confirmar que el usuario sigue activo

```js
// Generación del token
const token = jwt.sign({ uid }, process.env.SECRETORPRIVATEKEY, { expiresIn: "1h" });

// Extracción del token
const authHeader = req.header("Authorization");
const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
```

---

## Base de datos — MongoDB

### Conexión

```js
// configs/mongo.js
mongoose.connect(process.env.URI_MONGO, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 50,
});
```

### Relaciones entre colecciones

```
Usuario
 ├── es autor de Publicacion (ref en publicacion.autor)
 ├── aparece en likes[] de Publicacion (ref en publicacion.likes)
 └── es autor de Comentario (ref en comentario.user)

Publicacion
 ├── pertenece a un Curso (ref en publicacion.curso)
 └── tiene muchos Comentarios (ref en publicacion.comentarios[])

Comentario
 └── pertenece a una Publicacion (ref en comentario.publicacion)
```

### Patrones de datos

- **Soft delete**: Los recursos no se eliminan físicamente. Se cambia `status` o `estado` a `false`.
- **Normalización a minúsculas**: `username` y `email` se guardan siempre en minúsculas.
- **Full-text search**: Índice de texto en `titulo` y `texto` de Publicacion.
- **Paginación**: Todos los listados aceptan `?page=1&limit=10` via `.skip().limit()`.

---

## Inicialización automática al arrancar

Al levantar el servidor se ejecutan tres tareas de seed:

```js
// configs/server.js — método listen()
await dbConnection();          // Conecta MongoDB
await TallerCurso();           // Crea curso "Taller" si no existe
await PracticaCurso();         // Crea curso "Practica" si no existe
await TecnologiaCurso();       // Crea curso "Tecnologia" si no existe
await createAdminUser();       // Crea usuario admin si no existe
```

---

## Tests unitarios

Framework: **Vitest 4.1.4**

Todos los tests evitan conexiones reales a MongoDB usando `vi.mock()` para reemplazar los modelos de Mongoose por implementaciones falsas.

### Cobertura por módulo

| Archivo | Tests | Casos cubiertos |
|---|---|---|
| `user.test.js` | 7 | register éxito/error, login éxito/usuario inexistente/desactivado/contraseña incorrecta, getProfile |
| `curso.test.js` | 3 | getCursos paginado, createCurso éxito/ya existe |
| `public.test.js` | 6 | getPublicaciones éxito/error, savePublicacion éxito/error, updatePublicacion éxito/error |
| `comentario.test.js` | 6 | saveComentario éxito/publicación no encontrada, updateComentario éxito/no encontrado, deleteComentario éxito/sin permiso |

### Patrón de testing aplicado

```js
// 1. Mock del modelo antes de importar el controlador
vi.mock("../user.model.js", () => {
    function MockUserModel(data) { Object.assign(this, data); }
    MockUserModel.prototype.save = vi.fn().mockResolvedValue({});
    MockUserModel.findOne = vi.fn().mockResolvedValue(userFalso);
    return { default: MockUserModel };
});

// 2. Importar el controlador que usa el modelo ya mockeado
import { register, login } from "../user.controller.js";

// 3. Test con req/res simulados
test("login - exito", async () => {
    const req = { body: { email: "...", password: "..." } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: "Login exitoso" }));
});
```

**Regla clave de aislamiento**: cuando un test sobreescribe un mock con `mockResolvedValueOnce`, el siguiente test debe restaurar el mock explícitamente para evitar que reciba `undefined`.

---

## Documentación de la API

Swagger UI disponible en: `http://localhost:3000/api-docs`

Generada automáticamente desde comentarios JSDoc en los archivos `*.routes.js` usando `swagger-jsdoc`.

Esquema de seguridad configurado: Bearer JWT aplicado globalmente.

```js
// configs/swagger.js
const options = {
    definition: {
        openapi: "3.0.0",
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./src/**/*.routes.js"],
};
```

---

## Variables de entorno

```env
PORT=3000
URI_MONGO=mongodb://localhost:27017/gestorOpinion
SECRETORPRIVATEKEY=<clave_privada_para_JWT>
AdminPassword=<contraseña_del_admin_por_defecto>
```

---

## Consideraciones si el proyecto crece

El proyecto tiene una base sólida, pero si escala hay puntos a reforzar:

### Separación de capas
Actualmente la lógica de negocio está directamente en los controllers. Con más módulos conviene extraer una capa de **servicios** (`user.service.js`) que contenga la lógica, dejando los controllers solo como traductores HTTP → servicio → respuesta.

```
Controller  →  Service  →  Model
(HTTP)         (lógica)    (DB)
```

### Validación de entorno
Agregar validación al arranque para asegurarse de que las variables de entorno críticas existen antes de levantar el servidor.

### Refresh tokens
El sistema actual usa tokens de 1 hora sin posibilidad de renovarlos. Para una app real conviene implementar refresh tokens con mayor duración almacenados en base de datos.

### Variables de entorno por ambiente
Separar `.env.development`, `.env.production`, `.env.test` para evitar que los tests interfieran con datos reales.

### Rate limiting por ruta
El rate limiter actual aplica globalmente. En producción conviene aplicar límites más estrictos específicamente en `/login` y `/register` para prevenir fuerza bruta.

### HTTPS
No hay redirección ni enforcement de HTTPS en el código. En producción esto se delega al proxy inverso (nginx, Caddy), pero vale tenerlo documentado.

### Logging estructurado
`morgan` es suficiente para desarrollo. En producción considerar un logger con niveles y salida JSON (como `pino` o `winston`) para facilitar el análisis de logs.

---

## Comandos

```bash
# Iniciar en desarrollo (con reinicio automático)
npm start

# Ejecutar todos los tests
npm run test

# Ejecutar tests de un módulo específico
npm run test src/user/test/user.test.js
npm run test src/cursos/test/curso.test.js
npm run test src/public/test/public.test.js
npm run test src/comentario/test/comentario.test.js
```
