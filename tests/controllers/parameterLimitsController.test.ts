import { beforeEach, describe, expect, it, vi } from "vitest";

const parameterLimitsServiceMock = {
  findAll: vi.fn(),
  findByTypeParam: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../src/services/parameterLimitsService.js", () => {
  return {
    parameterLimitsService: parameterLimitsServiceMock,
  };
});

function makeReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply;
}

describe("ParameterLimitsController - Suporte a Limites de Parâmetro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os limites de parâmetro", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findAll.mockResolvedValueOnce([
      { id: 1, idTypeParam: 2, minExpected: 0, maxExpected: 50 },
    ]);
    const reply = makeReply();

    await parameterLimitsController.list({} as any, reply);

    expect(parameterLimitsServiceMock.findAll).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalledWith([
      { id: 1, idTypeParam: 2, minExpected: 0, maxExpected: 50 },
    ]);
  });

  it("deve listar limites por idTypeParam", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findByTypeParam.mockResolvedValueOnce([
      { id: 2, idTypeParam: 3, minExpected: 10, maxExpected: 20 },
    ]);
    const reply = makeReply();

    await parameterLimitsController.findByTypeParam({ params: { idTypeParam: 3 } } as any, reply);

    expect(parameterLimitsServiceMock.findByTypeParam).toHaveBeenCalledWith(3);
    expect(reply.send).toHaveBeenCalledWith([
      { id: 2, idTypeParam: 3, minExpected: 10, maxExpected: 20 },
    ]);
  });

  it("deve retornar 400 ao receber ID inválido para busca", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    const reply = makeReply();

    await parameterLimitsController.findById({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
  });

  it("deve retornar 404 se limite de parâmetro não existir", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterLimitsController.findById({ params: { id: "12" } } as any, reply);

    expect(parameterLimitsServiceMock.findById).toHaveBeenCalledWith(12);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Limite de parâmetro não encontrado." });
  });

  it("deve retornar o limite encontrado ao buscar por id", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce({
      id: 12,
      idTypeParam: 3,
      minExpected: 5,
      maxExpected: 20,
    });
    const reply = makeReply();

    await parameterLimitsController.findById({ params: { id: "12" } } as any, reply);

    expect(parameterLimitsServiceMock.findById).toHaveBeenCalledWith(12);
    expect(reply.send).toHaveBeenCalledWith({
      id: 12,
      idTypeParam: 3,
      minExpected: 5,
      maxExpected: 20,
    });
  });

  it("deve retornar 201 ao criar novo limite de parâmetro", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.create.mockResolvedValueOnce({
      id: 1,
      idTypeParam: 2,
      minExpected: 5,
      maxExpected: 40,
    });
    const reply = makeReply();

    await parameterLimitsController.create(
      {
        body: {
          idTypeParam: 2,
          minExpected: 5,
          maxExpected: 40,
        },
      } as any,
      reply
    );

    expect(parameterLimitsServiceMock.create).toHaveBeenCalledWith({
      idTypeParam: 2,
      minExpected: 5,
      maxExpected: 40,
    });
    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      id: 1,
      idTypeParam: 2,
      minExpected: 5,
      maxExpected: 40,
    });
  });

  it("deve retornar 400 ao criar sem campos obrigatórios", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    const reply = makeReply();

    await parameterLimitsController.create({ body: { idTypeParam: 0, minExpected: 0 } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Os campos 'idTypeParam', 'minExpected' e 'maxExpected' são obrigatórios.",
    });
  });

  it("deve retornar 400 ao criar sem minExpected", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    const reply = makeReply();

    await parameterLimitsController.create(
      { body: { idTypeParam: 2, maxExpected: 40 } } as any,
      reply,
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Os campos 'idTypeParam', 'minExpected' e 'maxExpected' são obrigatórios.",
    });
  });

  it("deve retornar 400 ao criar sem maxExpected", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    const reply = makeReply();

    await parameterLimitsController.create(
      { body: { idTypeParam: 2, minExpected: 5 } } as any,
      reply,
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Os campos 'idTypeParam', 'minExpected' e 'maxExpected' são obrigatórios.",
    });
  });

  it("deve retornar 400 ao atualizar com ID inválido", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    const reply = makeReply();

    await parameterLimitsController.update({ params: { id: "invalido" }, body: { minExpected: 1 } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
  });

  it("deve retornar 404 ao atualizar limite inexistente", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterLimitsController.update({ params: { id: "10" }, body: { minExpected: 2 } } as any, reply);

    expect(parameterLimitsServiceMock.findById).toHaveBeenCalledWith(10);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Limite de parâmetro não encontrado." });
  });

  it("deve retornar 400 ao atualizar sem informar campos", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce({ id: 1, idTypeParam: 2, minExpected: 0, maxExpected: 1 });
    const reply = makeReply();

    await parameterLimitsController.update({ params: { id: "1" }, body: {} } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Informe ao menos um campo para atualização." });
  });

  it("deve atualizar campos informados em um limite existente", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce({ id: 1, idTypeParam: { id: 2 }, minExpected: 0, maxExpected: 10 });
    parameterLimitsServiceMock.update.mockResolvedValueOnce({ id: 1, idTypeParam: { id: 3 }, minExpected: 1, maxExpected: 11 });
    const reply = makeReply();

    await parameterLimitsController.update(
      { params: { id: "1" }, body: { idTypeParam: 3, minExpected: 1, maxExpected: 11 } } as any,
      reply,
    );

    expect(parameterLimitsServiceMock.update).toHaveBeenCalledWith(1, {
      idTypeParam: 3,
      minExpected: 1,
      maxExpected: 11,
    });
    expect(reply.send).toHaveBeenCalledWith({ id: 1, idTypeParam: { id: 3 }, minExpected: 1, maxExpected: 11 });
  });

  it("deve retornar 400 ao excluir com ID inválido", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    const reply = makeReply();

    await parameterLimitsController.delete({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "ID inválido!" });
  });

  it("deve retornar 404 ao excluir limite inexistente", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterLimitsController.delete({ params: { id: "12" } } as any, reply);

    expect(parameterLimitsServiceMock.findById).toHaveBeenCalledWith(12);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Limite de parâmetro não encontrado." });
  });

  it("deve retornar 204 ao excluir limite existente", async () => {
    const { parameterLimitsController } = await import("../../src/controllers/parameterLimitsController.js");
    parameterLimitsServiceMock.findById.mockResolvedValueOnce({ id: 1, idTypeParam: 2 });
    parameterLimitsServiceMock.delete.mockResolvedValueOnce(true);
    const reply = makeReply();

    await parameterLimitsController.delete({ params: { id: "1" } } as any, reply);

    expect(parameterLimitsServiceMock.delete).toHaveBeenCalledWith(1);
    expect(reply.status).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith({ message: "Limite de parâmetro excluído com sucesso!" });
  });
});
