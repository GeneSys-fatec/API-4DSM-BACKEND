import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { stationController } from "./controllers/stationController.js";

export async function routes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/healthcheck", async (_request: FastifyRequest, _reply: FastifyReply) => {
        return { status: "ok" };
    });

    fastify.get("/stations", stationController.list);
    fastify.get("/stations/city/:city", stationController.findByCity);
    fastify.get("/stations/:id", stationController.findById);
    fastify.post("/stations", stationController.create);
}