import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0', // Versión de OpenAPI
        info: {
            title: 'Gestor Opiniones API',
            version: '1.0.0',
            description: 'API para gestionar publicaciones y comentarios por curso',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http', // Tipo de autenticación
                    scheme: 'bearer', // Esquema de autenticación
                    bearerFormat: 'JWT', // Formato del token
                }
            }
        },
        security: [{ bearerAuth: [] }] // Requiere autenticación para todas las rutas
    },
    apis: ['./src/**/*.routes.js'],// Ruta a los archivos donde se encuentran las anotaciones de Swagger
};

export const swaggerSpec = swaggerJSDoc(options);
