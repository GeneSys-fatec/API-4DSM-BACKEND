import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { parameterTypeController } from "../controllers/parameterTypeController.js";

const parameterTypeIdSchema = z.object({
    id: z.string().describe("Parameter type id"),
});

const numericInputSchema = z.preprocess((value) => {
    if (typeof value === "string") {
        return Number(value.replace(",", "."));
    }

    return value;
}, z.number());

const parameterTypeCreateBodySchema = z.object({
    name: z.string(),
    unit: z.string(),
    factor: numericInputSchema,
    offset: numericInputSchema,
    description: z.string().optional(),
});

const parameterTypeUpdateBodySchema = parameterTypeCreateBodySchema.partial();

export async function parameterTypeRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Listagem de tipos de parâmetro",
        },
        handler: parameterTypeController.list,
    });

    fastify.get("/:id", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Localize tipos de parâmetro pelo id",
            params: parameterTypeIdSchema,
        },
        handler: parameterTypeController.findById,
    });

    fastify.post("/create", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Crie um novo tipo de parâmetro",
            body: parameterTypeCreateBodySchema,
        },
        handler: parameterTypeController.create,
    });

    fastify.put("/update/:id", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Atualize um tipo de parâmetro pelo id",
            params: parameterTypeIdSchema,
            body: parameterTypeUpdateBodySchema,
        },
        handler: parameterTypeController.update,
    });

    fastify.delete("/delete/:id", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Delete um tipo de parâmetro pelo id",
            params: parameterTypeIdSchema,
        },
        handler: parameterTypeController.delete,
    });
}
