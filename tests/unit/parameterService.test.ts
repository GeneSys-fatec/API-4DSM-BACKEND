import { describe, expect, it, vi, beforeEach } from "vitest";
import type { WhereExpressionBuilder } from "typeorm";
import { Brackets } from "typeorm";

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

describe("ParameterService - Suporte a Parâmetros Meteorológicos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar todos os parâmetros cadastrados ordenados por id", async () => {

    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();
    repositoryMock.find.mockResolvedValueOnce([{ id: 1 }]);

    const result = await service.findAll();

    expect(repositoryMock.find).toHaveBeenCalledWith({ order: { id: "ASC" } });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("deve retornar null ao buscar parâmetro inexistente", async () => {

    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.findById(123);

    expect(repositoryMock.findOneBy).toHaveBeenCalledWith({ id: 123 });
    expect(result).toBeNull();
  });

  it("deve criar novo parâmetro meteorológico associado a uma estação", async () => {

    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const createdEntity = { id: 1 };
    repositoryMock.create.mockReturnValueOnce(createdEntity);
    repositoryMock.save.mockResolvedValueOnce({ ...createdEntity, saved: true });

    const result = await service.create({ idStation: 1, idTypeParam: 2, isActive: true });

    expect(repositoryMock.create).toHaveBeenCalledWith({
      idStation: 1,
      idTypeParam: 2,
    });
    expect(repositoryMock.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual({ id: 1, saved: true });
  });

  it("deve buscar parâmetros por estação aplicando filtros no banco", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const queryBuilderMock = {
      leftJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([{ id: 9, idStation: 1 }]),
    };

    repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

    const result = await service.findByStation(1, { q: "temp" });

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("parameter");
    expect(queryBuilderMock.getMany).toHaveBeenCalledOnce();
    expect(result).toEqual([{ id: 9, idStation: 1 }]);
  });

  it("deve montar a busca textual com joins e condições compostas", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const whereMock = vi.fn().mockReturnThis();
    const orWhereMock = vi.fn().mockReturnThis();
    const bracketQueryBuilderMock = {
      where: whereMock,
      orWhere: orWhereMock,
    };

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockImplementation((condition: unknown) => {
        if (condition instanceof Brackets) {
          condition.whereFactory(bracketQueryBuilderMock as unknown as WhereExpressionBuilder);
        }

        return queryBuilderMock;
      }),
      leftJoin: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([{ id: 11 }]),
    };

    repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

    const result = await service.findAll({ q: "Temp" });

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("parameter");
    expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
    expect(whereMock).toHaveBeenCalledWith("CAST(parameter.id AS TEXT) LIKE :term", { term: "%temp%" });
    expect(orWhereMock).toHaveBeenCalledTimes(5);
    expect(result).toEqual([{ id: 11 }]);
  });

  it("deve aplicar filtros sem busca textual quando q não for informado", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([{ id: 12, idStation: 4 }]),
    };

    repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

    const result = await service.findAll({ idStation: 4, from: new Date("2024-03-01") });

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("parameter");
    expect(queryBuilderMock.leftJoin).not.toHaveBeenCalled();
    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("parameter.idStation = :idStation", { idStation: 4 });
    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("parameter.createdAt >= :from", {
      from: expect.any(Date),
    });
    expect(result).toEqual([{ id: 12, idStation: 4 }]);
  });

  it("deve aplicar todos os filtros e joins da busca avançada", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const queryBuilderMock = {
      orderBy: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValueOnce([{ id: 10, idStation: 2, idTypeParam: 3 }]),
    };

    repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

    const result = await service.findAll({
      idStation: 2,
      idTypeParam: 3,
      q: "Temp",
      from: new Date("2024-01-01"),
      to: new Date("2024-01-31"),
    });

    expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("parameter");
    expect(queryBuilderMock.leftJoin).toHaveBeenCalledTimes(2);
    expect(queryBuilderMock.andWhere).toHaveBeenCalled();
    expect(result).toEqual([{ id: 10, idStation: 2, idTypeParam: 3 }]);
  });

  it("deve atualizar um parâmetro existente", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const existing = { id: 1, idStation: 1, idTypeParam: 2 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.save.mockResolvedValueOnce({ ...existing, idStation: 3, updatedBy: "system" });

    const result = await service.update(1, { idStation: 3, isActive: true });

    expect(repositoryMock.save).toHaveBeenCalledWith({
      id: 1,
      idStation: 3,
      idTypeParam: 2,
      isActive: true,
      updatedBy: "system",
    });
    expect(result).toEqual({ id: 1, idStation: 3, idTypeParam: 2, updatedBy: "system" });
  });

  it("deve retornar null ao atualizar parâmetro inexistente", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.update(99, { idTypeParam: 4 });

    expect(result).toBeNull();
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it("deve remover um parâmetro existente", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();

    const existing = { id: 7 };
    repositoryMock.findOneBy.mockResolvedValueOnce(existing);
    repositoryMock.remove.mockResolvedValueOnce(undefined);

    const result = await service.delete(7);

    expect(repositoryMock.remove).toHaveBeenCalledWith(existing);
    expect(result).toBe(true);
  });

  it("deve retornar false ao excluir parâmetro inexistente", async () => {
    const { ParameterService } = await import("../../src/services/parameterService.js");
    const service = new ParameterService();
    repositoryMock.findOneBy.mockResolvedValueOnce(null);

    const result = await service.delete(404);

    expect(result).toBe(false);
    expect(repositoryMock.remove).not.toHaveBeenCalled();
  });
});
