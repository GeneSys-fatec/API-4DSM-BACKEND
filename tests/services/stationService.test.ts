import { describe, expect, it, vi, beforeEach } from "vitest";
import { StationService } from "../../src/services/stationService.js";

vi.mock("typeorm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("typeorm")>();
  return {
    ...actual,
    Brackets: class Brackets {
      constructor(cb: any) {
        cb({
          where: vi.fn().mockReturnThis(),
          orWhere: vi.fn().mockReturnThis(),
          andWhere: vi.fn().mockReturnThis(),
        });
      }
    },
  };
});

const repositoryMock = vi.hoisted(() => ({
  find: vi.fn(),
  findOneBy: vi.fn(),
  findBy: vi.fn(),
  createQueryBuilder: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("../../src/data-source.js", () => {
  return {
    AppDataSource: {
      getRepository: () => repositoryMock,
    },
  };
});

describe("StationService - Critérios de Aceitação: CRUD de Estações", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Critério: Todas as estações cadastradas devem ser listadas - retorna todas as estações ordenadas", async () => {
    const service = new StationService();

    repositoryMock.find.mockResolvedValueOnce([
      { id: 1, name: "Estação Sul" },
      { id: 2, name: "Estação Norte" },
    ]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({
      order: { id: "ASC" },
    });
    expect(result).toHaveLength(2);
  });

  it("Critério: Deve filtrar estações diretamente no banco quando houver filtros", async () => {
    const service = new StationService();

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([{ id: 1, name: "Estação Sul" }]),
    };

    repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

    const result = await service.findAll({ q: "sul", status: "ativa" });

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("station");
    expect(queryBuilderMock.getMany).toHaveBeenCalledOnce();
    expect(result).toEqual([{ id: 1, name: "Estação Sul" }]);
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - retorna null se não encontra", async () => {
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.findById(999);

    expect(result).toBeNull();
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - cria com valores default", async () => {
    const service = new StationService();

    const createdEntity = { id: 9 };
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    const result = await service.create({
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
    });

    expect(repositoryMock.create).toHaveBeenCalledWith({
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
      isActive: true,
      createdBy: "system",
      updatedBy: "system",
    });
    expect(result).toEqual({ id: 1, saved: true });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna null se não encontra", async () => {
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.update(1, { name: "X" });

    expect(result).toBeNull();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("Critério: O sistema deve permitir editar e remover estações - atualiza e salva", async () => {
    const service = new StationService();

    const existing = { id: 1, name: "Estação Antigo" };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, name: "Estação Novo", updatedBy: "system" });

    const result = await service.update(1, { name: "Estação Novo" });

    expect(repositoryMock.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: "Estação Novo", updatedBy: "system" });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna false se não encontra para deletar", async () => {
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.delete(1);

    expect(result).toBe(false);
    expect(repositoryMock.remove).not.toHaveBeenCalled();
  });

  it("Critério: O sistema deve permitir editar e remover estações - remove estação existente", async () => {
    const service = new StationService();

    const existing = { id: 1, name: "Estação para remover" };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.remove.mockResolvedValueOnce(undefined);

    const result = await service.delete(1);

    expect(repositoryMock.remove).toHaveBeenCalledWith(existing);
    expect(result).toBe(true);
  });

  it("Critério: O sistema deve conseguir buscar pelo nome e pelo endereço", async () => {
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce({ id: 1, name: "Estação Teste" });
    await service.findByName("Estação Teste");
    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ name: "Estação Teste" });

    repositoryMock.findBy.mockResolvedValueOnce([{ id: 1, address: "Rua Y" }]);
    await service.findByAddress("Rua Y");
    expect(repositoryMock.findBy).toHaveBeenCalledWith({ address: "Rua Y" });
  });

  it("Critério: O sistema deve buscar estações otimizadas para o mapa", async () => {
    const service = new StationService();

    const mapQueryBuilderMock = {
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([]),
    };
    repositoryMock.createQueryBuilder.mockReturnValueOnce(mapQueryBuilderMock);

    await service.findForMap();
    
    expect(mapQueryBuilderMock.getMany).toHaveBeenCalledOnce();
  });

  it("Critério: Deve cobrir as ramificações de filtro complexo no findAll", async () => {
    const service = new StationService();

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([]),
    };
    repositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);

    await service.findAll({
        idDatalogger: "DL-123",
        user: "admin",
        from: new Date("2024-01-01"),
        to: new Date("2024-01-31"),
        isActive: false
    });

    expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(5); 
  });

  it("Critério: O sistema deve adotar fallback para status vazios e isActive no create", async () => {
    const service = new StationService();

    repositoryMock.find.mockResolvedValueOnce([]);
    await service.findAll({ q: "   ", status: "   " });
    expect(repositoryMock.find).toHaveBeenCalled();

    repositoryMock.create.mockReturnValueOnce({ id: 99 });
    repositoryMock.save.mockResolvedValueOnce({ id: 99 });
    
    await service.create({
      name: "Estação Sem IsActive Opcional",
      address: "Local",
      latitude: "0",
      longitude: "0",
      idDatalogger: "DL-X",
      status: "Ativa",
    });

    expect(repositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
      isActive: true
    }));
  });

  it("Critério: Deve garantir a execução isolada de status e to no query builder", async () => {
    const service = new StationService();

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([]),
    };
    repositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);

    await service.findAll({ status: "Inativa" });
    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("LOWER(station.status) = :status", { status: "inativa" });

    const dateTo = new Date("2024-12-31");
    await service.findAll({ to: dateTo });
    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("station.createdAt <= :to", { to: dateTo });
  });

  it("V8 Forcer: deve executar saídas isoladas do QueryBuilder (Linhas 61 e 91)", async () => {
    const service = new StationService();

    repositoryMock.find.mockResolvedValueOnce([]);
    await service.findAll(); 
    expect(repositoryMock.find).toHaveBeenCalled();

    const qbMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([]),
    };
    repositoryMock.createQueryBuilder.mockReturnValue(qbMock);
    
    await service.findAll({ status: "ATIVO" });
    expect(qbMock.andWhere).toHaveBeenCalledWith("LOWER(station.status) = :status", { status: "ativo" });
  });
});