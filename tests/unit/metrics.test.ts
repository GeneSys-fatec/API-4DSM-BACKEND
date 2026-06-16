import { describe, it, expect, beforeEach } from "vitest";
import client from "prom-client";
import {
  initializeMetrics,
  setApplicationHealth,
  getMetricsRegistry,
  getMetricsContentType,
  applicationHealthStatus,
  activeRequestsGauge,
  httpRequestsTotal,
  httpErrorsTotal,
} from "../../src/utils/metrics.js";
import {
  metricsMiddleware,
  metricsResponseHook,
} from "../../src/middleware/metricsMiddleware.js";
import type { FastifyRequest, FastifyReply } from "fastify";

describe("Metrics Utility", () => {
  beforeEach(() => {
    applicationHealthStatus.reset();
    activeRequestsGauge.reset();
    httpRequestsTotal.reset();
    httpErrorsTotal.reset();
  });

  it("deve inicializar o status de saúde da aplicação como 1 (ok)", () => {
    initializeMetrics();
    const metric = client.register.getSingleMetric("application_health_status");
    expect(metric).toBeDefined();
  });

  it("deve definir o status de saúde da aplicação corretamente", () => {
    setApplicationHealth(true);
    setApplicationHealth(false);
    const metric = client.register.getSingleMetric("application_health_status");
    expect(metric).toBeDefined();
  });

  it("deve retornar o registro de métricas e o content type correspondente", async () => {
    const registry = await getMetricsRegistry();
    const contentType = getMetricsContentType();

    expect(typeof registry).toBe("string");
    expect(contentType).toBe(client.register.contentType);
  });
});

describe("Metrics Middleware", () => {
  beforeEach(() => {
    activeRequestsGauge.reset();
    httpRequestsTotal.reset();
    httpErrorsTotal.reset();
  });

  it("deve registrar o início de uma requisição e incrementar activeRequestsGauge", async () => {
    const req = {
      method: "GET",
      url: "/test-route?param=1",
    } as unknown as FastifyRequest;

    const reply = {} as unknown as FastifyReply;

    await metricsMiddleware(req, reply);

    const metricsStr = await client.register.metrics();
    expect(metricsStr).toContain('http_active_requests{method="GET",route="/test-route"} 1');
  });

  it("deve registrar o fim de uma requisição de sucesso (status 200)", async () => {
    const req = {
      method: "POST",
      url: "/api/data",
    } as unknown as FastifyRequest;

    const reply = {
      statusCode: 200,
    } as unknown as FastifyReply;

    await metricsMiddleware(req, reply);
    await metricsResponseHook(req, reply);

    const metricsStr = await client.register.metrics();
    expect(metricsStr).toContain('http_requests_total{method="POST",route="/api/data",status_code="200"} 1');
    expect(metricsStr).toContain('http_active_requests{method="POST",route="/api/data"} 0');
  });

  it("deve registrar o fim de uma requisição com erro (status >= 400)", async () => {
    const req = {
      method: "GET",
      url: "/api/bad-request",
    } as unknown as FastifyRequest;

    const reply = {
      statusCode: 400,
    } as unknown as FastifyReply;

    await metricsMiddleware(req, reply);
    await metricsResponseHook(req, reply);

    const metricsStr = await client.register.metrics();
    expect(metricsStr).toContain('http_errors_total{method="GET",route="/api/bad-request",status_code="400"} 1');
  });
});
