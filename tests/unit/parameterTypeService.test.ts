import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMock = vi.hoisted(() => ({
  find: vi.fn(),
  findOneBy: vi.fn(),
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

describe("ParameterTypeService - Suporte a Tipos de Parâmetro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os tipos de parâmetro ordenados por id", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();
    repositoryMock.find.mockResolvedValueOnce([{ id: 1, name: "Temperatura" }]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({ order: { id: "ASC" } });
    expect(result).toEqual([{ id: 1, name: "Temperatura" }]);
  });

  it("deve aplicar filtros de busca e período na consulta", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([{ id: 2, name: "Pressão" }]),
    };

    repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

    const result = await service.findAll({ q: "press", from: new Date("2024-01-01") });

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("parameterType");
    expect(queryBuilderMock.getMany).toHaveBeenCalledOnce();
    expect(result).toEqual([{ id: 2, name: "Pressão" }]);
  });

  it("deve retornar null ao buscar tipo de parâmetro inexistente", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.findById(999);

    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: 999 });
    expect(result).toBeNull();
  });

  it("deve criar novo tipo de parâmetro", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();

    const createdEntity = { id: 1 };
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    const result = await service.create({
      json_key: "surface_pressure",
      name: "Pressão",
      unit: "hPa",
      factor: 1,
      offset: 0,
      description: "",
    });

    expect(repositoryMock.create).toHaveBeenCalledWith({
      json_key: "surface_pressure",
      name: "Pressão",
      unit: "hPa",
      factor: 1,
      offset: 0,
      description: "",
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual({ id: 1, saved: true });
  });

  it("deve retornar null ao atualizar tipo de parâmetro inexistente", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.update(1, { name: "Novo" });

    expect(result).toBeNull();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("deve atualizar e salvar tipo de parâmetro existente", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();

    const existing = { id: 1, json_key: "temperature_2m", name: "Temperatura", unit: "C", factor: 1, offset: 0, description: "" };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, name: "Temperatura externa" });

    const result = await service.update(1, { name: "Temperatura externa" });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      json_key: "temperature_2m",
      name: "Temperatura externa",
      unit: "C",
      factor: 1,
      offset: 0,
      description: "",
    });
    expect(result).toEqual({
      id: 1,
      json_key: "temperature_2m",
      name: "Temperatura externa",
      unit: "C",
      factor: 1,
      offset: 0,
      description: "",
    });
  });

  it("deve retornar false ao excluir tipo de parâmetro inexistente", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.delete(1);

    expect(result).toBe(false);
    expect(repositoryMock.remove).not.toHaveBeenCalled();
  });

  it("deve remover tipo de parâmetro existente", async () => {
    const { ParameterTypeService } = await import("../../src/services/parameterTypeService.js");
    const service = new ParameterTypeService();

    const existing = { id: 1, name: "Pressão" };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.remove.mockResolvedValueOnce(undefined);

    const result = await service.delete(1);

    expect(repositoryMock.remove).toHaveBeenCalledWith(existing);
    expect(result).toBe(true);
  });
});