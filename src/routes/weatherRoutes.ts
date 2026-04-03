import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import weatherController from "../controllers/weatherController.js";
import { z } from "zod";

const weatherStationIdSchema = z.object({
    stationId: z.string().describe("Station id"),
});

export async function weatherRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/:stationId", {
        schema: {
            tags: ["weather"],
            summary: "Veja o atual clima pelo id da estação",
            params: weatherStationIdSchema,
        },
        handler: weatherController.getCurrentWeather,
    });
}