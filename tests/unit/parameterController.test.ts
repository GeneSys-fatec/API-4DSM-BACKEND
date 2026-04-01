import { beforeEach, describe, expect, it, vi } from "vitest";

const parameterServiceMock = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
};

vi.mock("../../src/services/parameterService.js", () => {
  return {
    parameterService: parameterServiceMock,
  };
});

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
    // Arrange
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findAll.mockResolvedValueOnce([
      { id: 1, idStation: 1 },
    ]);
    const reply = makeReply();

    // Act
    await parameterController.list({} as any, reply);

    // Assert
    expect(parameterServiceMock.findAll).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalledWith([{ id: 1, idStation: 1 }]);
  });

  it("deve retornar 400 ao receber ID inválido para buscar parâmetro", async () => {
    // Arrange
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();

    // Act
    await parameterController.findById({ params: { id: "nao-um-numero" } } as any, reply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Invalid parameter id" });
  });

  it("deve retornar 404 se parâmetro não existe", async () => {
    // Arrange
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    // Act
    await parameterController.findById({ params: { id: "10" } } as any, reply);

    // Assert
    expect(parameterServiceMock.findById).toHaveBeenCalledWith(10);
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Parameter not found" });
  });

  it("deve retornar 201 ao criar novo parâmetro meteorológico", async () => {
    // Arrange
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    parameterServiceMock.create.mockResolvedValueOnce({
      id: 1,
      idStation: 1,
    });
    const reply = makeReply();

    // Act
    await parameterController.create(
      { body: { idStation: 1, idTypeParam: 2 } } as any,
      reply
    );

    // Assert
    expect(parameterServiceMock.create).toHaveBeenCalledWith({
      idStation: 1,
      idTypeParam: 2,
    });
    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it("deve retornar 400 ao criar sem campos obrigatórios", async () => {
    // Arrange
    const { parameterController } = await import("../../src/controllers/parameterController.js");
    const reply = makeReply();

    // Act
    await parameterController.create({ body: { idStation: 0 } } as any, reply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Fields 'idStation' and 'idTypeParam' are required",
    });
  });
});
