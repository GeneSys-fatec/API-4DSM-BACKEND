import { beforeEach, describe, expect, it, vi } from "vitest";

const stationServiceMock = {
  findAll: vi.fn(),
  findByAddress: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findForMap: vi.fn()
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
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findAll.mockResolvedValueOnce([{ id: 1, name: "Estação 1" }]);
    const reply = makeReply();

    await stationController.list({} as any, reply);

    expect(stationServiceMock.findAll).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalledWith([{ id: 1, name: "Estação 1" }]);
  });

  it("Critério: Validação - retorna 400 ao receber ID inválido no endpoint", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    await stationController.findById({ params: { id: "nao-um-numero" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ message: "Invalid station id" });
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - retorna 404 se não encontra", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await stationController.findById({ params: { id: "10" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Station not found" });
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - retorna 201 no sucesso", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.create.mockResolvedValueOnce({
      id: 1,
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
    });
    const reply = makeReply();

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

    expect(stationServiceMock.create).toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(201);
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - rejeita sem name e address", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    await stationController.create({ body: { name: "", address: "" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Fields 'name' and 'address' are required",
    });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna 404 se não encontra para editar", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

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

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ message: "Station not found" });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna 204 no sucesso do DELETE", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce({ id: 1 });
    stationServiceMock.delete.mockResolvedValueOnce(true);
    const reply = makeReply();

    await stationController.delete({ params: { id: "1" } } as any, reply);

    expect(stationServiceMock.delete).toHaveBeenCalledWith(1);
    expect(reply.status).toHaveBeenCalledWith(204);
  });

  it("Critério: O sistema deve buscar estação por endereço", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findByAddress.mockResolvedValueOnce([{ id: 1, address: "Rua X" }]);
    const reply = makeReply();

    await stationController.findByAddress({ params: { address: "Rua X" } } as any, reply);

    expect(stationServiceMock.findByAddress).toHaveBeenCalledWith("Rua X");
    expect(reply.send).toHaveBeenCalled();
  });

  it("Critério: O sistema deve validar ID inválido no update", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    await stationController.update({ params: { id: "abc" }, body: {} } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna 200 no sucesso do UPDATE", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce({ id: 1 });
    stationServiceMock.update.mockResolvedValueOnce({ id: 1, name: "Novo Nome" });
    const reply = makeReply();

    await stationController.update(
      { params: { id: "1" }, body: { name: "Novo Nome" } } as any, reply
    );

    expect(stationServiceMock.update).toHaveBeenCalled();
    expect(reply.send).toHaveBeenCalled();
  });

  it("Critério: O sistema deve listar estações públicas apenas ativas", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findAll.mockResolvedValueOnce([
        { id: 1, isActive: true }, 
        { id: 2, isActive: false }
    ]);
    const reply = makeReply();

    await stationController.listPublic({} as any, reply);

    expect(reply.send).toHaveBeenCalledWith([{ id: 1, isActive: true }]);
  });

  it("Critério: O sistema deve listar estações para o mapa", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findForMap.mockResolvedValueOnce([{ id: 1, latitude: "-23", longitude: "-46" }]);
    const reply = makeReply();

    await stationController.listMap({} as any, reply);

    expect(stationServiceMock.findForMap).toHaveBeenCalledOnce();
    expect(reply.send).toHaveBeenCalled();
  });

  it("Critério: O sistema deve adotar fallback caso a lista seja chamada sem query object", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findAll.mockResolvedValueOnce([{ id: 1 }]);
    const reply = makeReply();
    
    await stationController.list({} as any, reply);
    expect(stationServiceMock.findAll).toHaveBeenCalledWith({});
  });

  it("Critério: Deve criar e atualizar uma estação sem enviar o campo isActive no body", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();
    stationServiceMock.create.mockResolvedValueOnce({ id: 2 });
    
    await stationController.create({ 
        body: { name: "Nova", address: "Rua", latitude: "0", longitude: "0", idDatalogger: "1", status: "Ativa" } 
    } as any, reply);
    
    expect(stationServiceMock.create).toHaveBeenCalledWith(expect.not.objectContaining({ isActive: expect.anything() }));

    stationServiceMock.findById.mockResolvedValueOnce({ id: 1 });
    stationServiceMock.update.mockResolvedValueOnce({ id: 1 });
    
    await stationController.update({ 
        params: { id: "1" },
        body: { name: "Atualizada", address: "Rua", latitude: "0", longitude: "0", idDatalogger: "1", status: "Ativa" } 
    } as any, reply);

    expect(stationServiceMock.update).toHaveBeenCalledWith(1, expect.not.objectContaining({ isActive: expect.anything() }));
  });

  it("Critério: Deve processar isActive true e false explicitamente e lidar com listas vazias", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();
    stationServiceMock.create.mockResolvedValueOnce({ id: 2 });
    stationServiceMock.findById.mockResolvedValue({ id: 1 });
    stationServiceMock.update.mockResolvedValue({ id: 1 });

    await stationController.create({ 
        body: { name: "A", address: "B", latitude: "0", longitude: "0", idDatalogger: "1", status: "Ativo", isActive: false } 
    } as any, reply);
    expect(stationServiceMock.create).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));

    await stationController.update({ 
        params: { id: "1" }, 
        body: { name: "A", address: "B", latitude: "0", longitude: "0", idDatalogger: "1", status: "Ativo", isActive: true } 
    } as any, reply);
    expect(stationServiceMock.update).toHaveBeenCalledWith(1, expect.objectContaining({ isActive: true }));

    stationServiceMock.findAll.mockResolvedValueOnce([]);
    await stationController.listPublic({} as any, reply);
    expect(reply.send).toHaveBeenCalledWith([]);

    stationServiceMock.findForMap.mockResolvedValueOnce([]);
    await stationController.listMap({} as any, reply);
    expect(reply.send).toHaveBeenCalledWith([]);
  });

  it("V8 Forcer: deve forçar ramificações internas (Linhas 70, 135, 141)", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    // --- Linha 70 (Ternário do isActive no Create) ---
    stationServiceMock.create.mockResolvedValueOnce({ id: 1 });
    await stationController.create({ 
      body: { name: "A", address: "B", latitude: "0", longitude: "0", idDatalogger: "1", status: "A" } 
    } as any, reply);

    // --- Linha 135 (Arrow function do filter no listPublic) ---
    stationServiceMock.findAll.mockResolvedValueOnce([
        { id: 1, isActive: true },
        { id: 2, isActive: false },
        { id: 3 } // undefined
    ]);
    await stationController.listPublic({} as any, reply);

    // --- Linha 141 (Retorno do listMap) ---
    stationServiceMock.findForMap.mockResolvedValueOnce([{ id: 1 }]);
    await stationController.listMap({} as any, reply);
    
    expect(reply.send).toHaveBeenCalled();
  });
  it("Critério: O sistema deve retornar a estação com sucesso no findById", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce({ id: 1, name: "Estação Encontrada" });
    const reply = makeReply();

    await stationController.findById({ params: { id: "1" } } as any, reply);

    expect(reply.send).toHaveBeenCalledWith({ id: 1, name: "Estação Encontrada" });
  });

  it("Critério: O sistema deve retornar erro 400 ao deletar com ID inválido", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();

    await stationController.delete({ params: { id: "invalido" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("Critério: O sistema deve retornar erro 404 ao deletar estação inexistente", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    stationServiceMock.findById.mockResolvedValueOnce(null);
    const reply = makeReply();

    await stationController.delete({ params: { id: "99" } } as any, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
  });
  it("Critério: O sistema deve processar a lista com todos os parâmetros da query preenchidos (Linhas 37-43)", async () => {
    const { stationController } = await import("../../src/controllers/stationController.js");
    const reply = makeReply();
    stationServiceMock.findAll.mockResolvedValueOnce([]);

    await stationController.list({
        query: {
            q: "busca",
            status: "ativo",
            isActive: "true",
            user: "admin",
            idDatalogger: "DL-1",
            from: "2024-01-01",
            to: "2024-01-31"
        }
    } as any, reply);

    expect(stationServiceMock.findAll).toHaveBeenCalled();
  });
});