import type { FastifyInstance } from "fastify";
import weatherController from "../controllers/weatherController.js";

export async function weatherRoutes(fastify: FastifyInstance) {
	fastify.get("/:stationId", weatherController.getCurrentWeather);
}