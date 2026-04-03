import { describe, expect, it, vi, beforeEach } from "vitest";

const repositoryMock = vi.hoisted(() => ({
  find: vi.fn(),
  findOneBy: vi.fn(),
  findBy: vi.fn(),
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
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    repositoryMock.find.mockResolvedValueOnce([
      { id: 1, name: "Estação Sul" },
      { id: 2, name: "Estação Norte" },
    ]);

    // Act
    const result = await service.findAll();

    // Assert
    expect(repositoryMock.find).toHaveBeenCalledWith({
      order: { id: "ASC" },
    });
    expect(result).toHaveLength(2);
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - retorna null se não encontra", async () => {
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    // Act
    const result = await service.findById(999);

    // Assert
    expect(result).toBeNull();
  });

  it("Critério: O administrador deve conseguir cadastrar uma estação - cria com valores default", async () => {
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    const createdEntity = { id: 1 };
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    // Act
    const result = await service.create({
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
    });

    // Assert
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
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    // Act
    const result = await service.update(1, { name: "X" });

    // Assert
    expect(result).toBeNull();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("Critério: O sistema deve permitir editar e remover estações - atualiza e salva", async () => {
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    const existing = { id: 1, name: "Estação Antigo" };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, name: "Estação Novo", updatedBy: "system" });

    // Act
    const result = await service.update(1, { name: "Estação Novo" });

    // Assert
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: "Estação Antigo", name: "Estação Novo", updatedBy: "system" });
  });

  it("Critério: O sistema deve permitir editar e remover estações - retorna false se não encontra para deletar", async () => {
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    // Act
    const result = await service.delete(1);

    // Assert
    expect(result).toBe(false);
    expect(repositoryMock.remove).not.toHaveBeenCalled();
  });

  it("Critério: O sistema deve permitir editar e remover estações - remove estação existente", async () => {
    // Arrange
    const { StationService } = await import("../../src/services/stationService.js");
    const service = new StationService();

    const existing = { id: 1, name: "Estação para remover" };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.remove.mockResolvedValueOnce(undefined);

    // Act
    const result = await service.delete(1);

    // Assert
    expect(repositoryMock.remove).toHaveBeenCalledWith(existing);
    expect(result).toBe(true);
  });
});
