import type { FastifyRequest, FastifyReply } from "fastify";
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpErrorsTotal,
  activeRequestsGauge,
} from "../utils/metrics.js";

const requestStartTimes = new WeakMap<FastifyRequest, number>();

export async function metricsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const method = request.method;
  const route = request.url.split("?")[0] || "/"; 
  const startTime = Date.now();

  requestStartTimes.set(request, startTime);

  activeRequestsGauge.labels(method, route).inc();
}
export async function metricsResponseHook(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const method = request.method;
  const route = request.url.split("?")[0] || "/"; 
  const startTime = requestStartTimes.get(request) || Date.now();

  const duration = (Date.now() - startTime) / 1000;
  const statusCode = reply.statusCode.toString();

  httpRequestsTotal.labels(method, route, statusCode).inc();
  httpRequestDurationSeconds.labels(method, route, statusCode).observe(duration);

  if (reply.statusCode >= 400) {
    httpErrorsTotal.labels(method, route, statusCode).inc();
  }
  activeRequestsGauge.labels(method, route).dec();
}
