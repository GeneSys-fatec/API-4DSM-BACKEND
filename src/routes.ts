import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { stationRoutes } from "./routes/stationRoutes.js";
import { parameterRoutes } from "./routes/parameterRoutes.js";
import { parameterTypeRoutes } from "./routes/parameterTypeRoutes.js";
import { weatherRoutes } from "./routes/weatherRoutes.js";
import { parameterLimitsRoutes } from "./routes/parameterLimitsRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { authenticate } from "./middleware/authenticate.js";
import { administratorRoutes } from "./routes/administratorRoutes.js";
import { stationController } from "./controllers/stationController.js";
import { parameterController } from "./controllers/parameterController.js";
import { parameterTypeController } from "./controllers/parameterTypeController.js";
import weatherController from "./controllers/weatherController.js
import { alertRoutes } from "./routes/alertRoutes.js"

export async function routes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get("/healthcheck", async (_request: FastifyRequest, _reply: FastifyReply) => {
        return { status: "ok" };
    });

    fastify.register(authRoutes, {prefix: "/auth"});
    
    // --- ROTAS PÚBLICAS DE LEITURA ---
    fastify.get('/stations/public', stationController.listPublic);
    fastify.get('/weather/public/:stationId', weatherController.getCurrentWeather);
    fastify.get('/parameter-types/public', parameterTypeController.list);
    fastify.get('/parameters/public/station/:idStation', parameterController.findByStation);

    // --- ROTAS PROTEGIDAS (Admin) ---
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook("preHandler", authenticate)
    
        protectedRoutes.register(stationRoutes, { prefix: '/stations' })
        protectedRoutes.register(parameterRoutes, { prefix: '/parameters' })
        protectedRoutes.register(parameterTypeRoutes, { prefix: "/parameter-types" })
        protectedRoutes.register(parameterLimitsRoutes, { prefix: "/parameter-limits" })
        protectedRoutes.register(alertRoutes, { prefix: "/alerts" })
        protectedRoutes.register(weatherRoutes, { prefix: "/weather" })
        protectedRoutes.register(administratorRoutes, {prefix: "/administrator"});
    })
}