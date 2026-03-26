import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ParameterLimitsController } from "../controllers/parameterLimitsControllert.js";

const controller = new ParameterLimitsController();

export async function parameterLimitRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get("/", controller.findAll.bind(controller));
    fastify.get("/:id", controller.findById.bind(controller));
    fastify.post("/", controller.create.bind(controller));
    fastify.put("/:id", controller.update.bind(controller));
    fastify.put("/:id/climate-risk", controller.updateClimateRiskLimits.bind(controller));
    fastify.delete("/:id", controller.delete.bind(controller));
    
}