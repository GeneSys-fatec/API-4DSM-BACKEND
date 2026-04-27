import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import weatherController from "../controllers/weatherController.js";
import { z } from "zod";

const weatherStationIdSchema = z.object({
    stationId: z.string().describe("Station id"),
});

const weatherRangeQuerySchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
});

export async function weatherRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/:stationId", {
        schema: {
            tags: ["weather"],
            summary: "Veja o atual clima pelo id da estação",
            params: weatherStationIdSchema,
            querystring: weatherRangeQuerySchema,
        },
        handler: weatherController.getCurrentWeather,
    });
}