import { beforeEach, describe, expect, it, vi } from "vitest";

const stationServiceMock = {
  findAll: vi.fn(),
  findByAddress: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../src/services/stationService.js", () => {
  return {
    stationService: stationServiceMock,
  };
});

function makeReply() {
  const reply: any = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  return reply;
}

describe("StationController - Critérios de Aceitação: API de Gerenciamento de Estações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Critério: Todas as estações cadastradas devem ser listadas - endpoint GET /stations", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findAll.mockResolvedValueOnce([{ id: 1, name: "Estação 1" }]);
    const reply = makeReply();

    // Act
    await stationController.list({} as any, reply);

    // Assert
    expect(stationServiceMock.findAll).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalledWith([{ id: 1, name: "Estação 1" }]);
  });

  it("Critério: Validação - retorna 400 ao receber ID inválido no endpoint", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    // Act
    await stationController.findById({ params: { id: "nao-um-numero" } } as any, reply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Invalid station id" });
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - retorna 404 se não encontra", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    // Act
    await stationController.findById({ params: { id: "10" } } as any, reply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Station not found" });
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - retorna 201 no sucesso", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.create.mockResolvedValueOnce({
      id: 1,
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
    });
    const reply = makeReply();

    // Act
    await stationController.create(
      {
        body: {
          name: "Estação Meteorológica Sul",
          address: "São Paulo, SP",
          latitude: "-23.5",
          longitude: "-46.6",
          idDatalogger: "DL-001",
          status: "Ativa",
        },
      } as any,
      reply
    );

    // Assert
    expect(stationServiceMock.create).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - rejeita sem name e address", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    // Act
    await stationController.create({ body: { name: "", address: "" } } as any, reply);

    // Assert
    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Fields 'name' and 'address' are required",
    });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna 404 se não encontra para editar", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    // Act
    await stationController.update(
      {
        params: { id: "1" },
        body: {
          name: "Estação Novo Nome",
          address: "Novo Endereço",
          latitude: "-23.5",
          longitude: "-46.6",
          idDatalogger: "DL-001",
          status: "Ativa",
        },
      } as any,
      reply
    );

    // Assert
    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Station not found" });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna 204 no sucesso do DELETE", async () => {
    // Arrange
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce({ id: 1 });
    stationServiceMock.delete.mockResolvedValueOnce(true);
    const reply = makeReply();

    // Act
    await stationController.delete({ params: { id: "1" } } as any, reply);

    // Assert
    expect(stationServiceMock.delete).toHaveBeenCalledWith(1);
    expect(reply.status).toHaveBeenCalledWith(204);
  });
});
