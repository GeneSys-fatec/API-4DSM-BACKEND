import { stationRoutes } from "./routes/stationRoutes.js";
import { parameterRoutes } from "./routes/parameterRoutes.js";
import { parameterTypeRoutes } from "./routes/parameterTypeRoutes.js";
import { weatherRoutes } from "./routes/weatherRoutes.js";
import { parameterLimitsRoutes } from "./routes/parameterLimitsRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { authenticate } from "./middleware/authenticate.js";
import { administratorRoutes } from "./routes/administratorRoutes.js";
import { alertRoutes } from "./routes/alertRoutes.js";
export async function routes(fastify, _options) {
    fastify.get("/healthcheck", async (_request, _reply) => {
        return { status: "ok" };
    });
    fastify.register(authRoutes, { prefix: "/auth" });
    fastify.register(async (protectedRoutes) => {
        protectedRoutes.addHook("preHandler", authenticate);
        protectedRoutes.register(stationRoutes, { prefix: '/stations' });
        protectedRoutes.register(parameterRoutes, { prefix: '/parameters' });
        protectedRoutes.register(parameterTypeRoutes, { prefix: "/parameter-types" });
        protectedRoutes.register(parameterLimitsRoutes, { prefix: "/parameter-limits" });
        protectedRoutes.register(alertRoutes, { prefix: "/alerts" });
        protectedRoutes.register(weatherRoutes, { prefix: "/weather" });
        protectedRoutes.register(administratorRoutes, { prefix: "/administrator" });
    });
}
//# sourceMappingURL=routes.js.map