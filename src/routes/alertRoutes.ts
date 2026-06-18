import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { alertController } from "../controllers/alertController.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/admin.js";

const alertIdSchema = z.object({
    id: z.string().describe("Alert id"),
});

const evaluateBodySchema = z.object({
    parameterId: z.number().int(),
    measuredValue: z.number(),
    occurredAt: z.string(),
});

const alertListQuerySchema = z.object({
    q: z.string().optional(),
    stationId: z.string().optional(),
    parameterId: z.string().optional(),
    idTypeParam: z.string().optional(),
    status: z.enum(["active", "resolved"]).optional(),
    user: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    isRead: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
});

export async function alertRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/", {
        schema: {
            tags: ["alertas"],
            summary: "Listagem de alertas climáticos",
            querystring: alertListQuerySchema,
        },
        preHandler: [authenticate, requireAdmin],
        handler: alertController.list,
    });

    fastify.patch("/read-all", {
        schema: {
            tags: ["alertas"],
            summary: "Marca todos os alertas pendentes como lidos",
        },
        preHandler: [authenticate, requireAdmin],
        handler: alertController.markAllAsRead,
    });

    fastify.patch("/:id/read", {
        schema: {
            tags: ["alertas"],
            summary: "Marca um alerta como lido",
            params: alertIdSchema,
        },
        preHandler: [authenticate, requireAdmin],
        handler: alertController.markAsRead,
    });

    fastify.delete("/clear", {
        schema: {
            tags: ["alertas"],
            summary: "Limpa (exclui/soft-delete) todos os alertas já lidos",
        },
        preHandler: [authenticate, requireAdmin],
        handler: alertController.clearRead,
    });

    fastify.delete("/delete/:id", {
        schema: {
            tags: ["alertas"],
            summary: "Remova um alerta",
            params: alertIdSchema,
        },
        preHandler: [authenticate, requireAdmin],
        handler: alertController.delete,
    });
}

export async function publicAlertRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/stream", {
        schema: {
            tags: ["alertas"],
            summary: "Stream de alertas em tempo real via Server-Sent Events (SSE)",
        },
        handler: alertController.stream,
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
