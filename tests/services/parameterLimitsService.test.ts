import { beforeEach, describe, expect, it, vi } from "vitest";
import { ParameterLimitsService } from "../../src/services/parameterLimitsService.js";

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
    const service = new ParameterLimitsService();
    repositoryMock.find.mockResolvedValueOnce([{ id: 1, idTypeParam: 2 }]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({ order: { id: "ASC" } });
    expect(result).toEqual([{ id: 1, idTypeParam: 2 }]);
  });

  it("deve buscar limites pelo idTypeParam", async () => {
    const service = new ParameterLimitsService();
    repositoryMock.findBy.mockResolvedValueOnce([{ id: 10, idTypeParam: 2 }]);

    const result = await service.findByTypeParam(2);

    expect(repositoryMock.findBy).toHaveBeenCalledWith({ idTypeParam: { id: 2 } });
    expect(result).toEqual([{ id: 10, idTypeParam: 2 }]);
  });

  it("deve retornar null ao buscar limite inexistente por id", async () => {
    const service = new ParameterLimitsService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.findById(999);

    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: 999 });
    expect(result).toBeNull();
  });

  it("deve criar novo limite de parâmetro", async () => {
    const service = new ParameterLimitsService();

    const createdEntity = { id: 1 };
    repositoryMock.findBy.mockResolvedValueOnce([]);
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    const result = await service.create({
      idTypeParam: 3,
      minExpected: 5,
      maxExpected: 35,
    });

    expect(repositoryMock.findBy).toHaveBeenCalledWith({ idTypeParam: { id: 3 } });
    expect(repositoryMock.create).toHaveBeenCalledWith({
      idTypeParam: { id: 3 },
      minExpected: 5,
      maxExpected: 35,
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual({ id: 1, saved: true });
  });

  it("deve atualizar o limite se já existir um cadastrado para o parâmetro ao tentar criar", async () => {
    const service = new ParameterLimitsService();

    const existingEntity = { id: 1, idTypeParam: { id: 3 }, minExpected: 0, maxExpected: 10 };
    repositoryMock.findBy.mockResolvedValueOnce([existingEntity]);
    repositoryMock.save.mockResolvedValueOnce({ ...existingEntity, minExpected: 5, maxExpected: 35 });

    const result = await service.create({
      idTypeParam: 3,
      minExpected: 5,
      maxExpected: 35,
    });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      idTypeParam: { id: 3 },
      minExpected: 5,
      maxExpected: 35,
    });
    expect(result).toEqual({ id: 1, idTypeParam: { id: 3 }, minExpected: 5, maxExpected: 35 });
  });

  it("deve retornar null ao atualizar limite inexistente", async () => {
    const service = new ParameterLimitsService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.update(1, { minExpected: 0 });

    expect(result).toBeNull();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("deve atualizar e salvar limite existente", async () => {
    const service = new ParameterLimitsService();

    const existing = { id: 1, idTypeParam: { id: 1 }, minExpected: 10, maxExpected: 20 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, maxExpected: 22 });

    const result = await service.update(1, { maxExpected: 22 });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      idTypeParam: { id: 1 },
      minExpected: 10,
      maxExpected: 22,
    });
    expect(result).toEqual({
      id: 1,
      idTypeParam: { id: 1 },
      minExpected: 10,
      maxExpected: 22,
    });
  });

  it("deve atualizar apenas o limite mínimo quando maxExpected estiver ausente", async () => {
    const service = new ParameterLimitsService();

    const existing = { id: 1, idTypeParam: { id: 1 }, minExpected: 10, maxExpected: 20 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, minExpected: 12 });

    const result = await service.update(1, { minExpected: 12 });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      idTypeParam: { id: 1 },
      minExpected: 12,
      maxExpected: 20,
    });
    expect(result).toEqual({
      id: 1,
      idTypeParam: { id: 1 },
      minExpected: 12,
      maxExpected: 20,
    });
  });

  it("deve atualizar também o tipo do parâmetro quando o idTypeParam é informado", async () => {
    const service = new ParameterLimitsService();

    const existing = { id: 1, idTypeParam: { id: 1 }, minExpected: 10, maxExpected: 20 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, idTypeParam: { id: 3 }, minExpected: 8, maxExpected: 18 });

    const result = await service.update(1, { idTypeParam: 3, minExpected: 8, maxExpected: 18 });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      idTypeParam: { id: 3 },
      minExpected: 8,
      maxExpected: 18,
    });
    expect(result).toEqual({
      id: 1,
      idTypeParam: { id: 3 },
      minExpected: 8,
      maxExpected: 18,
    });
  });

  it("deve retornar false ao excluir limite inexistente", async () => {
    const service = new ParameterLimitsService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.delete(1);

    expect(result).toBe(false);
    expect(repositoryMock.remove).not.toHaveBeenCalled();
  });

  it("deve remover limite existente", async () => {
    const service = new ParameterLimitsService();

    const existing = { id: 1, idTypeParam: { id: 1 } };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.remove.mockResolvedValueOnce(undefined);

    const result = await service.delete(1);

    expect(repositoryMock.remove).toHaveBeenCalledWith(existing);
    expect(result).toBe(true);
  });
});
