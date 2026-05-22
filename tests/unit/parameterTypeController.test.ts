import { beforeEach, describe, expect, it, vi } from "vitest";

const parameterTypeServiceMock = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../src/services/parameterTypeService.js", () => {
  return {
    parameterTypeService: parameterTypeServiceMock,
  };
});

function makeReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply;
}

describe("ParameterTypeController - Suporte a Tipos de Parâmetro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os tipos de parâmetro cadastrados", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findAll.mockResolvedValueOnce([
      { id: 1, json_key: "temperature_2m", name: "Temperatura", unit: "C", factor: 1, offset: 0, description: "" },
    ]);
    const reply = makeReply();

    await parameterTypeController.list({} as any, reply);

    expect(parameterTypeServiceMock.findAll).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalledWith([
      { id: 1, json_key: "temperature_2m", name: "Temperatura", unit: "C", factor: 1, offset: 0, description: "" },
    ]);
  });

  it("deve repassar filtros de busca e período para o service", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findAll.mockResolvedValueOnce([]);
    const reply = makeReply();

    await parameterTypeController.list(
      { query: { q: "temp", from: "2024-01-01", to: "2024-01-31" } } as any,
      reply,
    );

    expect(parameterTypeServiceMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "temp",
        from: expect.any(Date),
        to: expect.any(Date),
      }),
    );
  });

  it("deve retornar 400 ao receber ID inválido para busca", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.findById({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
  });

  it("deve retornar 404 se o tipo de parâmetro não for encontrado na atualização", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterTypeController.update({ params: { id: "10" }, body: { name: "Novo" } } as any, reply);

    expect(parameterTypeServiceMock.findById).toHaveBeenCalledWith(10);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Parâmetro não encontrado." });
  });

  it("deve retornar 404 se tipo de parâmetro não existir", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterTypeController.findById({ params: { id: "12" } } as any, reply);

    expect(parameterTypeServiceMock.findById).toHaveBeenCalledWith(12);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Parâmetro não encontrado." });
  });

  it("deve retornar o tipo de parâmetro encontrado ao buscar por id", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({
      id: 12,
      json_key: "temperature_2m",
      name: "Temperatura",
      unit: "C",
      factor: 1,
      offset: 0,
      description: "",
    });
    const reply = makeReply();

    await parameterTypeController.findById({ params: { id: "12" } } as any, reply);

    expect(parameterTypeServiceMock.findById).toHaveBeenCalledWith(12);
    expect(reply.send).toHaveBeenCalledWith({
      id: 12,
      json_key: "temperature_2m",
      name: "Temperatura",
      unit: "C",
      factor: 1,
      offset: 0,
      description: "",
    });
  });

  it("deve retornar 201 ao criar um novo tipo de parâmetro", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.create.mockResolvedValueOnce({
      id: 1,
      json_key: "surface_pressure",
      name: "Pressão",
      unit: "hPa",
      factor: 1,
      offset: 0,
      description: "",
    });
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          json_key: "surface_pressure",
          name: "Pressão",
          unit: "hPa",
          factor: 1,
          offset: 0,
        },
      } as any,
      reply
    );

    expect(parameterTypeServiceMock.create).toHaveBeenCalledWith({
      json_key: "surface_pressure",
      name: "Pressão",
      unit: "hPa",
      factor: 1,
      offset: 0,
      description: "",
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      id: 1,
      json_key: "surface_pressure",
      name: "Pressão",
      unit: "hPa",
      factor: 1,
      offset: 0,
      description: "",
    });
  });

  it("deve retornar 400 ao criar sem campos obrigatórios", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          json_key: "",
          name: "",
          unit: "",
          factor: undefined,
          offset: undefined,
        },
      } as any,
      reply
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Os campos 'json_key', 'name', 'unit', 'factor' e 'offset' são obrigatórios.",
    });
  });

  it("deve retornar 400 ao criar sem name", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          json_key: "surface_pressure",
          name: "",
          unit: "hPa",
          factor: 1,
          offset: 0,
        },
      } as any,
      reply,
    );

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 400 ao criar sem unit", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          json_key: "surface_pressure",
          name: "Pressão",
          unit: "",
          factor: 1,
          offset: 0,
        },
      } as any,
      reply,
    );

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 400 ao criar sem factor", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          json_key: "surface_pressure",
          name: "Pressão",
          unit: "hPa",
          factor: undefined,
          offset: 0,
        },
      } as any,
      reply,
    );

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 400 ao criar sem offset", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          json_key: "surface_pressure",
          name: "Pressão",
          unit: "hPa",
          factor: 1,
          offset: undefined,
        },
      } as any,
      reply,
    );

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 400 ao atualizar com ID inválido", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.update({ params: { id: "invalido" }, body: { name: "Novo" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
  });

  it("deve retornar 400 ao atualizar sem informar campos", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({ id: 1, name: "Umidade" });
    const reply = makeReply();

    await parameterTypeController.update({ params: { id: "1" }, body: {} } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Informe ao menos um campo para atualização." });
  });

  it("deve atualizar um tipo existente quando receber campos parciais", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({ id: 1, name: "Umidade" });
    parameterTypeServiceMock.update.mockResolvedValueOnce({ id: 1, name: "Umidade Atualizada" });
    const reply = makeReply();

    await parameterTypeController.update(
      { params: { id: "1" }, body: { name: "Umidade Atualizada", description: "Nova descrição" } } as any,
      reply,
    );

    expect(parameterTypeServiceMock.update).toHaveBeenCalledWith(1, {
      name: "Umidade Atualizada",
      description: "Nova descrição",
    });
    expect(reply.send).toHaveBeenCalledWith({ id: 1, name: "Umidade Atualizada" });
  });

  it("deve atualizar um tipo existente quando receber os campos restantes", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({ id: 2, name: "Temperatura" });
    parameterTypeServiceMock.update.mockResolvedValueOnce({
      id: 2,
      json_key: "temp_2m",
      name: "Temperatura do ar",
      unit: "C",
      factor: 1,
      offset: 0,
    });
    const reply = makeReply();

    await parameterTypeController.update(
      {
        params: { id: "2" },
        body: {
          json_key: "temp_2m",
          unit: "C",
          factor: 1,
          offset: 0,
        },
      } as any,
      reply,
    );

    expect(parameterTypeServiceMock.update).toHaveBeenCalledWith(2, {
      json_key: "temp_2m",
      unit: "C",
      factor: 1,
      offset: 0,
    });
    expect(reply.send).toHaveBeenCalledWith({
      id: 2,
      json_key: "temp_2m",
      name: "Temperatura do ar",
      unit: "C",
      factor: 1,
      offset: 0,
    });
  });

  it("deve retornar 400 ao excluir com ID inválido", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.delete({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
  });

  it("deve retornar 404 ao excluir tipo inexistente", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterTypeController.delete({ params: { id: "12" } } as any, reply);

    expect(parameterTypeServiceMock.findById).toHaveBeenCalledWith(12);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Parâmetro não encontrado." });
  });

  it("deve retornar 204 ao excluir tipo de parâmetro existente", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({ id: 1, name: "Umidade" });
    parameterTypeServiceMock.delete.mockResolvedValueOnce(true);
    const reply = makeReply();

    await parameterTypeController.delete({ params: { id: "1" } } as any, reply);

    expect(parameterTypeServiceMock.delete).toHaveBeenCalledWith(1);
    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith({ message: "Parâmetro excluído com sucesso!" });
  });
});