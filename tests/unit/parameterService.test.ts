import { describe, expect, it, vi, beforeEach } from "vitest";

const repositoryMock = vi.hoisted(() => ({
  find: vi.fn(),
  findOneBy: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
}));

vi.mock("../../src/data-source.js", () => {
  return {
    AppDataSource: {
      getRepository: () => repositoryMock,
    },
  };
});

describe("ParameterService - Suporte a Parâmetros Meteorológicos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os parâmetros cadastrados ordenados por id", async () => {
    // Arrange
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();
    repositoryMock.find.mockResolvedValueOnce([{ id: 1 }]);

    // Act
    const result = await service.findAll();

    // Assert
    expect(repositoryMock.find).toHaveBeenCalledWith({ order: { id: "ASC" } });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("deve retornar null ao buscar parâmetro inexistente", async () => {
    // Arrange
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    // Act
    const result = await service.findById(123);

    // Assert
    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: 123 });
    expect(result).toBeNull();
  });

  it("deve criar novo parâmetro meteorológico associado a uma estação", async () => {
    // Arrange
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const createdEntity = { id: 1 };
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    // Act
    const result = await service.create({ idStation: 1, idTypeParam: 2, isActive: true });

    // Assert
    expect(repositoryMock.create).toHaveBeenCalledWith({
      idStation: 1,
      idTypeParam: 2,
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual({ id: 1, saved: true });
  });
});
