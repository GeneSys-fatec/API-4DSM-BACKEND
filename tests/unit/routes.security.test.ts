import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { routes } from "../../src/routes"; 
import { authRoutes } from "../../src/routes/authRoutes";
import { stationRoutes } from "../../src/routes/stationRoutes";

describe("Segurança das Rotas e Acesso Público", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify();

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(routes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("Deve permitir acesso SEM TOKEN à listagem pública de estações", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/stations/public",
    });

    expect(response.statusCode).not.toBe(401);
  });

  it("Deve permitir acesso SEM TOKEN aos dados climáticos públicos", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/weather/public/1",
    });

    expect(response.statusCode).not.toBe(401);
  });

  it("Deve BLOQUEAR acesso SEM TOKEN à listagem administrativa de estações", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/stations",
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.payload)).toHaveProperty("error"); 
  });

  it("Deve BLOQUEAR criação de estação SEM TOKEN", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/stations/create",
      payload: {
        name: "Estação Hacker",
        address: "Invasão, SP",
        latitude: "-23.0",
        longitude: "-45.0",
        idDatalogger: "HACK-01",
        status: "online"
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("Deve BLOQUEAR deleção de estação SEM TOKEN", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/stations/delete/1",
    });

    expect(response.statusCode).toBe(401);
  });
});