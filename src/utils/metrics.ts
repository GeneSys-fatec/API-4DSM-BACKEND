import client from "prom-client";

  
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Número total de requisições HTTP processadas",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duração das requisições HTTP em segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

export const httpErrorsTotal = new client.Counter({
  name: "http_errors_total",
  help: "Número total de erros HTTP (status >= 400)",
  labelNames: ["method", "route", "status_code"],
});

export const activeRequestsGauge = new client.Gauge({
  name: "http_active_requests",
  help: "Número de requisições HTTP ativas no momento",
  labelNames: ["method", "route"],
});

export const applicationHealthStatus = new client.Gauge({
  name: "application_health_status",
  help: "Status de saúde da aplicação (1 = ok, 0 = erro)",
});

export function initializeMetrics(): void {
  applicationHealthStatus.set(1);
}

export function setApplicationHealth(healthy: boolean): void {
  applicationHealthStatus.set(healthy ? 1 : 0);
}

export async function getMetricsRegistry(): Promise<string> {
  return client.register.metrics();
}

export function getMetricsContentType(): string {
  return client.register.contentType;
}
