import type { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { getMetricsRegistry, getMetricsContentType } from "../utils/metrics.js";

export async function metricsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get("/metrics", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const metrics = await getMetricsRegistry();
      const contentType = getMetricsContentType();

      reply.type(contentType);
      return reply.send(metrics);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Erro ao gerar métricas" });
    }
  });
}
