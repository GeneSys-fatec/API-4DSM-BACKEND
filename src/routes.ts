import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { stationRoutes } from "./routes/stationRoutes.js";
import { parameterRoutes } from "./routes/parameterRoutes.js";
import { parameterTypeRoutes } from "./routes/parameterTypeRoutes.js";
import { weatherRoutes } from "./routes/weatherRoutes.js";

export async function routes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/healthcheck", async (_request: FastifyRequest, _reply: FastifyReply) => {
        return { status: "ok" };
    });

    fastify.register(stationRoutes, { prefix: '/stations' })
    fastify.register(parameterRoutes, { prefix: '/parameters' })
    fastify.register(parameterTypeRoutes, { prefix: "/parameter-types" })
    fastify.register(parameterRoutes, {prefix: '/parameter-limits'})
    fastify.register(weatherRoutes, { prefix: "/weather" });

}