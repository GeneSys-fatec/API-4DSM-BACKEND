import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { z } from "zod";
import { measurementsController } from "../controllers/measurementsController.js";

const measurementsQuerySchema = z.object({
    stationId: z.coerce.number().optional().describe("ID da estação"),
    parameterId: z.coerce.number().optional().describe("ID do parâmetro"),
    startDate: z.string().optional().describe("Data inicial (ISO)"),
    endDate: z.string().optional().describe("Data final (ISO)"),
    period: z.enum(["24h", "7d", "30d"]).optional().describe("Filtro rápido de período"),
    page: z.coerce.number().min(1).optional().describe("Página atual"),
    limit: z.coerce.number().min(1).max(1000).optional().describe("Itens por página"),
});

export async function measurementsRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/", {
        schema: {
            tags: ["medições"],
            summary: "Consulta paginada de medições",
            querystring: measurementsQuerySchema,
        },
        handler: measurementsController.getMeasurements,
    });

    fastify.get("/aggregations", {
        schema: {
            tags: ["medições"],
            summary: "Consulta de agregações (Média, Máx, Mín) de medições",
            querystring: measurementsQuerySchema,
        },
        handler: measurementsController.getAggregations,
    });
}