import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { alertController } from "../controllers/alertController.js";

const alertIdSchema = z.object({
    id: z.string().describe("Alert id"),
});

const createAlertBodySchema = z.object({
    parameterId: z.number().int(),
    measuredValue: z.number(),
    occurredAt: z.string(),
    description: z.string().min(1),
});

const updateAlertBodySchema = createAlertBodySchema.partial().extend({
    status: z.enum(["active", "resolved"]).optional(),
});

const evaluateBodySchema = z.object({
    parameterId: z.number().int(),
    measuredValue: z.number(),
    occurredAt: z.string(),
});

export async function alertRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/", {
        schema: {
            tags: ["alertas"],
            summary: "Listagem de alertas climáticos",
        },
        handler: alertController.list,
    });

    fastify.post("/create", {
        schema: {
            tags: ["alertas"],
            summary: "Cadastre um alerta",
            body: createAlertBodySchema,
        },
        handler: alertController.create,
    });

    fastify.put("/update/:id", {
        schema: {
            tags: ["alertas"],
            summary: "Atualize um alerta",
            params: alertIdSchema,
            body: updateAlertBodySchema,
        },
        handler: alertController.update,
    });

    fastify.delete("/delete/:id", {
        schema: {
            tags: ["alertas"],
            summary: "Remova um alerta",
            params: alertIdSchema,
        },
        handler: alertController.delete,
    });

    fastify.post("/evaluate", {
        schema: {
            tags: ["alertas"],
            summary: "Gere alertas automaticamente a partir de uma medição",
            body: evaluateBodySchema,
        },
        handler: alertController.evaluate,
    });
}
