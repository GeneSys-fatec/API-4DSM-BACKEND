import { beforeEach, describe, expect, it, vi } from "vitest";

const parameterServiceMock: any = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  findByStation: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../src/services/parameterService.js", () => {
  return {
    parameterService: parameterServiceMock,
  };
});

parameterServiceMock.findAll = vi.fn();
parameterServiceMock.findById = vi.fn();
parameterServiceMock.create = vi.fn();
parameterServiceMock.findByStation = vi.fn();
parameterServiceMock.update = vi.fn();
parameterServiceMock.delete = vi.fn();

function makeReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply;
}

describe("ParameterController - Suporte a Parâmetros Meteorológicos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os parâmetros cadastrados via GET /parameters", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findAll.mockResolvedValueOnce([
      { id: 1, idStation: 1 },
    ]);
    const reply = makeReply();

    await parameterController.list({ query: {} } as any, reply);

    expect(parameterServiceMock.findAll).toHaveBeenCalledWith({});
    expect(reply.send).toHaveBeenCalledWith([{ id: 1, idStation: 1 }]);
  });

  it("deve listar parâmetros quando a query estiver ausente", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findAll.mockResolvedValueOnce([]);
    const reply = makeReply();

    await parameterController.list({} as any, reply);

    expect(parameterServiceMock.findAll).toHaveBeenCalledWith({});
    expect(reply.send).toHaveBeenCalledWith([]);
  });

  it("deve passar parâmetros de filtro na listagem", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findAll.mockResolvedValueOnce([]);
    const reply = makeReply();

    const request = {
      query: { q: "temp", idStation: "1", idTypeParam: "2", from: "2026-01-01" },
    };

    await parameterController.list(request as any, reply);

    expect(parameterServiceMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
            q: "temp",
            idStation: 1,
            idTypeParam: 2,
        from: expect.any(Date),
        })
    );
  });

  it("deve passar o filtro to na listagem de parâmetros", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findAll.mockResolvedValueOnce([]);
    const reply = makeReply();

    await parameterController.list(
      { query: { to: "2026-01-31" } } as any,
      reply,
    );

    expect(parameterServiceMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.any(Date),
      }),
    );
  });

  it("deve listar parâmetros por estação via GET /parameters/station/:idStation", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findByStation.mockResolvedValueOnce([{ id: 1, idStation: 10 }]);
    const reply = makeReply();

    await parameterController.findByStation({ params: { idStation: "10" }, query: { idTypeParam: "5" } } as any, reply);

    expect(parameterServiceMock.findByStation).toHaveBeenCalledWith(10, expect.objectContaining({ idTypeParam: 5 }));
    expect(reply.send).toHaveBeenCalledWith([{ id: 1, idStation: 10 }]);
  });

  it("deve listar parâmetros por estação mesmo sem query opcional", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findByStation.mockResolvedValueOnce([{ id: 2, idStation: 11 }]);
    const reply = makeReply();

    await parameterController.findByStation({ params: { idStation: "11" } } as any, reply);

    expect(parameterServiceMock.findByStation).toHaveBeenCalledWith(11, {});
    expect(reply.send).toHaveBeenCalledWith([{ id: 2, idStation: 11 }]);
  });

  it("deve passar todos os filtros na busca por estação", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findByStation.mockResolvedValueOnce([{ id: 3, idStation: 12 }]);
    const reply = makeReply();

    await parameterController.findByStation(
      {
        params: { idStation: "12" },
        query: { q: "temp", idTypeParam: "2", from: "2026-01-01", to: "2026-01-31" },
      } as any,
      reply,
    );

    expect(parameterServiceMock.findByStation).toHaveBeenCalledWith(
      12,
      expect.objectContaining({
        q: "temp",
        idTypeParam: 2,
        from: expect.any(Date),
        to: expect.any(Date),
      }),
    );
    expect(reply.send).toHaveBeenCalledWith([{ id: 3, idStation: 12 }]);
  });


  it("deve retornar 400 ao receber ID inválido para buscar parâmetro", async () => {

    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();

    await parameterController.findById({ params: { id: "nao-um-numero" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Invalid parameter id" });
  });

  it("deve retornar 404 se parâmetro não existe", async () => {

    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await parameterController.findById({ params: { id: "10" } } as any, reply);

    expect(parameterServiceMock.findById).toHaveBeenCalledWith(10);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Parameter not found" });
  });

  it("deve retornar o parâmetro encontrado ao buscar por id", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findById.mockResolvedValueOnce({ id: 10, idStation: 1, idTypeParam: 2 });
    const reply = makeReply();

    await parameterController.findById({ params: { id: "10" } } as any, reply);

    expect(parameterServiceMock.findById).toHaveBeenCalledWith(10);
    expect(reply.send).toHaveBeenCalledWith({ id: 10, idStation: 1, idTypeParam: 2 });
  });

  it("deve retornar 201 ao criar novo parâmetro meteorológico", async () => {

    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.create.mockResolvedValueOnce({
      id: 1,
      idStation: 1,
    });
    const reply = makeReply();

    await parameterController.create(
      { body: { idStation: 1, idTypeParam: 2 } } as any,
      reply
    );

    expect(parameterServiceMock.create).toHaveBeenCalledWith({
      idStation: 1,
      idTypeParam: 2,
    });
    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it("deve criar novo parâmetro incluindo isActive quando informado", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.create.mockResolvedValueOnce({ id: 2, idStation: 1, idTypeParam: 2, isActive: true });
    const reply = makeReply();

    await parameterController.create(
      { body: { idStation: 1, idTypeParam: 2, isActive: true } } as any,
      reply,
    );

    expect(parameterServiceMock.create).toHaveBeenCalledWith({
      idStation: 1,
      idTypeParam: 2,
      isActive: true,
    });
    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it("deve retornar 400 ao criar sem campos obrigatórios", async () => {

    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();

    await parameterController.create({ body: { idStation: 0 } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Fields 'idStation' and 'idTypeParam' are required",
    });
  });

  it("deve retornar 400 ao atualizar com ID inválido", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();

    await parameterController.update({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 404 ao atualizar parâmetro inexistente", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();
    parameterServiceMock.findById.mockResolvedValueOnce(null);

    await parameterController.update({ params: { id: "999" }, body: {} } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
  });

  it("deve atualizar um parâmetro existente e retornar 200", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();
    parameterServiceMock.findById.mockResolvedValueOnce({ id: 1, idStation: 1, idTypeParam: 1 });
    parameterServiceMock.update.mockResolvedValueOnce({ id: 1, idStation: 2, idTypeParam: 2, isActive: true });

    await parameterController.update({ params: { id: "1" }, body: { idStation: 2, idTypeParam: 2, isActive: true } } as any, reply);

    expect(parameterServiceMock.update).toHaveBeenCalledWith(1, { idStation: 2, idTypeParam: 2, isActive: true });
    expect(reply.send).toHaveBeenCalledWith({ id: 1, idStation: 2, idTypeParam: 2, isActive: true });
  });

  it("deve atualizar um parâmetro existente sem informar isActive", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();
    parameterServiceMock.findById.mockResolvedValueOnce({ id: 2, idStation: 1, idTypeParam: 1 });
    parameterServiceMock.update.mockResolvedValueOnce({ id: 2, idStation: 3, idTypeParam: 4 });

    await parameterController.update(
      { params: { id: "2" }, body: { idStation: 3, idTypeParam: 4 } } as any,
      reply,
    );

    expect(parameterServiceMock.update).toHaveBeenCalledWith(2, { idStation: 3, idTypeParam: 4 });
    expect(reply.send).toHaveBeenCalledWith({ id: 2, idStation: 3, idTypeParam: 4 });
  });

  it("deve retornar 400 ao deletar com ID inválido", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();

    await parameterController.delete({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("deve retornar 404 ao deletar parâmetro inexistente", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();
    parameterServiceMock.findById.mockResolvedValueOnce(null);

    await parameterController.delete({ params: { id: "999" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
  });

  it("deve deletar um parâmetro e retornar 204", async () => {
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();
    parameterServiceMock.findById.mockResolvedValueOnce({ id: 1 });
    parameterServiceMock.delete.mockResolvedValueOnce(true);

    await parameterController.delete({ params: { id: "1" } } as any, reply);

    expect(parameterServiceMock.delete).toHaveBeenCalledWith(1);
    expect(reply.status).toHaveBeenCalledWith(204);
  });
});
