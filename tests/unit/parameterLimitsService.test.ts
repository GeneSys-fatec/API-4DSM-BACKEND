import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("ParameterLimitsService - Suporte a Limites de Parâmetro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os limites de parâmetro ordenados por id", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();
    repositoryMock.find.mockResolvedValueOnce([{ id: 1, idTypeParam: 2 }]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({ order: { id: "ASC" } });
    expect(result).toEqual([{ id: 1, idTypeParam: 2 }]);
  });

  it("deve buscar limites pelo idTypeParam", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();
    repositoryMock.findBy.mockResolvedValueOnce([{ id: 10, idTypeParam: 2 }]);

    const result = await service.findByTypeParam(2);

    expect(repositoryMock.findBy).toHaveBeenCalledWith({ idTypeParam: 2 });
    expect(result).toEqual([{ id: 10, idTypeParam: 2 }]);
  });

  it("deve retornar null ao buscar limite inexistente por id", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.findById(999);

    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: 999 });
    expect(result).toBeNull();
  });

  it("deve criar novo limite de parâmetro", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();

    const createdEntity = { id: 1 };
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    const result = await service.create({
      idTypeParam: 3,
      minExpected: 5,
      maxExpected: 35,
    });

    expect(repositoryMock.create).toHaveBeenCalledWith({
      idTypeParam: 3,
      minExpected: 5,
      maxExpected: 35,
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual({ id: 1, saved: true });
  });

  it("deve retornar null ao atualizar limite inexistente", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.update(1, { minExpected: 0 });

    expect(result).toBeNull();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("deve atualizar e salvar limite existente", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();

    const existing = { id: 1, idTypeParam: 1, minExpected: 10, maxExpected: 20 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, maxExpected: 22 });

    const result = await service.update(1, { maxExpected: 22 });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      idTypeParam: 1,
      minExpected: 10,
      maxExpected: 22,
    });
    expect(result).toEqual({
      id: 1,
      idTypeParam: 1,
      minExpected: 10,
      maxExpected: 22,
    });
  });

  it("deve retornar false ao excluir limite inexistente", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.delete(1);

    expect(result).toBe(false);
    expect(repositoryMock.remove).not.toHaveBeenCalled();
  });

  it("deve remover limite existente", async () => {
    const { ParameterLimitsService } = await import("../../src/services/parameterLimitsService.js");
    const service = new ParameterLimitsService();

    const existing = { id: 1, idTypeParam: 1 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.remove.mockResolvedValueOnce(undefined);

    const result = await service.delete(1);

    expect(repositoryMock.remove).toHaveBeenCalledWith(existing);
    expect(result).toBe(true);
  });
});
