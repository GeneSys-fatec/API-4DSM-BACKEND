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
      { id: 1, key: "temp", name: "Temperatura", unit: "C", factor: 1, offset: 0, description: "" },
    ]);
    const reply = makeReply();

    await parameterTypeController.list({} as any, reply);

    expect(parameterTypeServiceMock.findAll).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalledWith([
      { id: 1, key: "temp", name: "Temperatura", unit: "C", factor: 1, offset: 0, description: "" },
    ]);
  });

  it("deve retornar 400 ao receber ID inválido para busca", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.findById({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
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

  it("deve retornar 201 ao criar um novo tipo de parâmetro", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.create.mockResolvedValueOnce({
      id: 1,
      key: "press",
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
          key: "press",
          name: "Pressão",
          unit: "hPa",
          factor: 1,
          offset: 0,
        },
      } as any,
      reply
    );

    expect(parameterTypeServiceMock.create).toHaveBeenCalledWith({
      key: "press",
      name: "Pressão",
      unit: "hPa",
      factor: 1,
      offset: 0,
      description: "",
    });
    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it("deve retornar 400 ao criar sem campos obrigatórios", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    const reply = makeReply();

    await parameterTypeController.create(
      {
        body: {
          key: "",
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
      message: "Os campos 'key', 'name', 'unit', 'factor' e 'offset' são obrigatórios.",
    });
  });

  it("deve retornar 400 ao atualizar sem informar campos", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({ id: 1, name: "Umidade" });
    const reply = makeReply();

    await parameterTypeController.update({ params: { id: "1" }, body: {} } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Informe ao menos um campo para atualização." });
  });

  it("deve retornar 204 ao excluir tipo de parâmetro existente", async () => {
    const { parameterTypeController } = await import("../../src/controllers/parameterTypeController.js");
    parameterTypeServiceMock.findById.mockResolvedValueOnce({ id: 1, name: "Umidade" });
    parameterTypeServiceMock.delete.mockResolvedValueOnce(true);
    const reply = makeReply();

    await parameterTypeController.delete({ params: { id: "1" } } as any, reply);

    expect(parameterTypeServiceMock.delete).toHaveBeenCalledWith(1);
    expect(reply.status).toHaveBeenCalledWith(204);
  });
});