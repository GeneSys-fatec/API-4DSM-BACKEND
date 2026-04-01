import "reflect-metadata";
import fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./routes.js";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform, jsonSchemaTransformObject } from "fastify-type-provider-zod";
import { initializeDatabase } from "./data-source.js";

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const start = async () => {
    await initializeDatabase();

    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "API 4DSM",
                description: "Documentação da API",
                version: "1.0.0"
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            },
            security: [{ bearerAuth: [] }]
        },
        transform: jsonSchemaTransform,
        transformObject: jsonSchemaTransformObject
    });

    await app.register(fastifySwaggerUi, {
        routePrefix: "/docs"
    });

    await app.register(cors, {
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
        optionsSuccessStatus: 204,
        strictPreflight: false,
    });
    await app.register(routes);

    try {
        await app.listen({ port: 3333, host: '0.0.0.0' })
    }
    catch (err) {
        process.exit(1)
    }
}

start();