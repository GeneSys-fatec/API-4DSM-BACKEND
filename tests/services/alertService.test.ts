import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlertService } from "../../src/services/alertService.js";

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

const alertRepositoryMock = vi.hoisted(() => ({
    find: vi.fn(),
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

const measurementRepositoryMock = vi.hoisted(() => ({
    create: vi.fn(),
    save: vi.fn(),
}));

const parameterRepositoryMock = vi.hoisted(() => ({
    findOneBy: vi.fn(),
}));

const parameterLimitsRepositoryMock = vi.hoisted(() => ({
    findOneBy: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
}));

const parameterTypeRepositoryMock = vi.hoisted(() => ({
    findOneBy: vi.fn(),
}));

vi.mock("../../src/data-source.js", () => {
    return {
        AppDataSource: {
            getRepository: (entity: { name: string }) => {
                if (entity.name === "AlertLogEntity") return alertRepositoryMock;
                if (entity.name === "MeasurementEntity") return measurementRepositoryMock;
                if (entity.name === "ParameterEntity") return parameterRepositoryMock;
                if (entity.name === "parameterLimitsEntity") return parameterLimitsRepositoryMock;
                if (entity.name === "parameterTypeEntity") return parameterTypeRepositoryMock;
                throw new Error(`Unknown repository requested: ${entity.name}`);
            },
        },
    };
});

describe("AlertService - Suporte a Alertas Climáticos", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve listar histórico de alertas", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[{ id: 1 }, { id: 2 }], 2]),
        };
        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const result = await service.listAlerts();

        expect(alertRepositoryMock.createQueryBuilder).toHaveBeenCalled();
        expect(result.data).toHaveLength(2);
    });

    it("deve aplicar paginacao ao listar alertas", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[{ id: 1 }], 1]),
        };
        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const result = await service.listAlerts({ page: 2, limit: 10 });

        expect(queryBuilderMock.skip).toHaveBeenCalledWith(10);
        expect(queryBuilderMock.take).toHaveBeenCalledWith(10);
        expect(result.page).toBe(2);
    });

    it("deve aplicar filtros ao listar histórico de alertas", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[{ id: 33 }], 1]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const result = await service.listAlerts({ status: "active", q: "temperatura" });

        expect(alertRepositoryMock.createQueryBuilder).toHaveBeenCalledWith("alert");
        expect(queryBuilderMock.getManyAndCount).toHaveBeenCalledOnce();
        expect(result.data).toEqual([{ id: 33 }]);
    });

    it("deve remover alerta existente", async () => {
        const service = new AlertService();

        alertRepositoryMock.findOne.mockResolvedValueOnce({ id: 10 });
        alertRepositoryMock.remove.mockResolvedValueOnce(undefined);

        const result = await service.deleteAlert(10);

        expect(alertRepositoryMock.remove).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it("deve buscar alerta pelo ID", async () => {
        const service = new AlertService();

        alertRepositoryMock.findOne.mockResolvedValueOnce({ id: 10 });
        const result = await service.findAlertById(10);
        expect(alertRepositoryMock.findOne).toHaveBeenCalledWith({
            where: { id: 10 },
            relations: { idParameter: true, idMeasurement: true },
        });
        expect(result).toEqual({ id: 10 });
    });

    it("deve marcar alerta como lido", async () => {
        const service = new AlertService();
        alertRepositoryMock.findOne.mockResolvedValueOnce({ id: 1, isRead: false });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 1, isRead: true });
        const result = await service.markAsRead(1);
        expect(alertRepositoryMock.save).toHaveBeenCalledWith(
            expect.objectContaining({ isRead: true })
        );
        expect(result).toBeTruthy();
    });

    it("deve retornar false ao tentar marcar alerta inexistente como lido", async () => {
        const service = new AlertService();
        alertRepositoryMock.findOne.mockResolvedValueOnce(null);
        const result = await service.markAsRead(999);
        expect(result).toBeFalsy();
    });

    it("deve marcar todos os alertas como lidos", async () => {
        const service = new AlertService();
        alertRepositoryMock.update.mockResolvedValueOnce({ affected: 5 });
        const result = await service.markAllAsRead();
        expect(alertRepositoryMock.update).toHaveBeenCalledWith({ isRead: false }, expect.objectContaining({ isRead: true, readAt: expect.any(Date) }));
        expect(result).toBe(5);
    });

    it("deve retornar 0 quando update não retornar affected no markAllAsRead", async () => {
        const service = new AlertService();
        alertRepositoryMock.update.mockResolvedValueOnce({});
        const result = await service.markAllAsRead();
        expect(result).toBe(0);
    });

    it("deve limpar alertas lidos", async () => {
        const service = new AlertService();
        alertRepositoryMock.delete.mockResolvedValueOnce({ affected: 3 });
        const result = await service.clearReadAlerts();
        expect(alertRepositoryMock.delete).toHaveBeenCalledWith({ isRead: true });
        expect(result).toBe(3);
    });
    
    it("deve lidar com erro ao limpar alertas (retornando 0 quando não tem affected)", async () => {
        const service = new AlertService();
        alertRepositoryMock.delete.mockResolvedValueOnce({});
        const result = await service.clearReadAlerts();
        expect(result).toBe(0);
    });
    
    it("deve lidar com erro ao limpar alertas (afetadas 0)", async () => {
        const service = new AlertService();
        alertRepositoryMock.delete.mockResolvedValueOnce({ affected: 0 });
        const result = await service.clearReadAlerts();
        expect(result).toBe(0);
    });

    it("deve lançar erro quando parameterId não existe", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce(null);

        await expect(service.evaluateMeasurement({
            parameterId: 99,
            measuredValue: 10,
            occurredAt: "2026-03-28T20:10:00.000Z",
        })).rejects.toThrow("Parameter not found");
    });
    
    it("deve lançar erro quando occurredAt for inválido", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });

        await expect(service.evaluateMeasurement({
            parameterId: 9,
            measuredValue: 10,
            occurredAt: "data-invalida",
        })).rejects.toThrow("Invalid occurredAt");
    });

    it("deve retornar array vazio se falhar ao salvar a medição", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockRejectedValueOnce(new Error("DB erro"));

        await expect(service.evaluateMeasurement({
            parameterId: 9,
            measuredValue: 10,
            occurredAt: "2026-03-28T20:10:00.000Z",
        })).rejects.toThrow("DB erro");
    });

    it("deve gerar alerta automático quando medição ultrapassar limite configurado", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 21 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 5,
            idTypeParam: 1,
            minExpected: 0,
            maxExpected: 35,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 1,
            json_key: "temperature_2m",
            name: "Temperatura",
            unit: "°C",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 30 });

        const generated = await service.evaluateMeasurement({
            parameterId: 7,
            measuredValue: 40,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(parameterLimitsRepositoryMock.findOne).toHaveBeenCalled();
        expect(alertRepositoryMock.create).toHaveBeenCalled();
        expect(generated).toHaveLength(1);
    });

    it("deve atualizar alerta ativo existente em vez de criar um novo ao ultrapassar limite", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 99 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 5,
            idTypeParam: 1,
            minExpected: 0,
            maxExpected: 35,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 1,
            json_key: "temperature_2m",
            name: "Temperatura",
            unit: "°C",
        });

        const existingAlert = {
            id: 10,
            idParameter: { id: 9 },
            status: "active",
        };
        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        alertRepositoryMock.save.mockResolvedValueOnce({ ...existingAlert, triggeredValue: 40 });

        const generated = await service.evaluateMeasurement({
            parameterId: 9,
            measuredValue: 40,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).not.toHaveBeenCalled();
        expect(alertRepositoryMock.save).toHaveBeenCalled();
        expect(generated).toHaveLength(1);
    });

    it("não deve gerar alerta automático quando medição estiver na faixa", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 21 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 5,
            idTypeParam: 1,
            minExpected: 0,
            maxExpected: 35,
        });

        const generated = await service.evaluateMeasurement({
            parameterId: 7,
            measuredValue: 30,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).not.toHaveBeenCalled();
        expect(generated).toHaveLength(0);
    });

    it("deve gerar texto específico para alerta automático de temperatura alta", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 99 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 5,
            idTypeParam: 1,
            minExpected: 0,
            maxExpected: 35,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 1,
            json_key: "temperature_2m",
            name: "Temperatura",
            unit: "°C",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 100 });

        await service.evaluateMeasurement({
            parameterId: 9,
            measuredValue: 40,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Temperatura",
                texto: expect.stringContaining("Cuidado! Temperatura muito alta."),
            }),
        );
    });

    it("deve gerar texto específico para alerta de temperatura baixa", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 99 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 5,
            idTypeParam: 1,
            minExpected: 5,
            maxExpected: 35,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 1,
            json_key: "temperature_2m",
            name: "Temperatura",
            unit: "°C",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 101 });

        await service.evaluateMeasurement({
            parameterId: 9,
            measuredValue: 2,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Temperatura",
                texto: expect.stringContaining("Temperatura muito baixa."),
            }),
        );
    });

    it("deve gerar texto específico para alerta de chuva acima do máximo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 10, idTypeParam: 2 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 50 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 6,
            idTypeParam: 2,
            minExpected: 0,
            maxExpected: 50,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 2,
            json_key: "precipitation",
            name: "Precipitação",
            unit: "mm",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 102 });

        await service.evaluateMeasurement({
            parameterId: 10,
            measuredValue: 80,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Chuva",
                texto: expect.stringContaining("Chuvas fortes"),
            }),
        );
    });

    it("deve gerar texto específico para alerta de chuva abaixo do mínimo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 10, idTypeParam: 2 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 51 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 6,
            idTypeParam: 2,
            minExpected: 10,
            maxExpected: 50,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 2,
            json_key: "precipitation",
            name: "Precipitação",
            unit: "mm",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 103 });

        await service.evaluateMeasurement({
            parameterId: 10,
            measuredValue: 3,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Chuva",
                texto: expect.stringContaining("abaixo do esperado"),
            }),
        );
    });

    it("deve gerar texto específico para alerta de vento acima do máximo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 11, idTypeParam: 3 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 52 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 7,
            idTypeParam: 3,
            minExpected: 0,
            maxExpected: 60,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 3,
            json_key: "wind_speed",
            name: "Velocidade do Vento",
            unit: "km/h",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 104 });

        await service.evaluateMeasurement({
            parameterId: 11,
            measuredValue: 90,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Vento",
                texto: expect.stringContaining("Ventos fortes"),
            }),
        );
    });

    it("deve gerar texto específico para alerta de vento abaixo do mínimo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 11, idTypeParam: 3 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 53 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 7,
            idTypeParam: 3,
            minExpected: 5,
            maxExpected: 60,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 3,
            json_key: "wind_speed",
            name: "Velocidade do Vento",
            unit: "km/h",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 105 });

        await service.evaluateMeasurement({
            parameterId: 11,
            measuredValue: 2,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Vento",
                texto: expect.stringContaining("abaixo do limite"),
            }),
        );
    });

    it("deve gerar texto específico para alerta de umidade acima do máximo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 12, idTypeParam: 4 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 54 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 8,
            idTypeParam: 4,
            minExpected: 20,
            maxExpected: 80,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 4,
            json_key: "humidity",
            name: "Umidade",
            unit: "%",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 106 });

        await service.evaluateMeasurement({
            parameterId: 12,
            measuredValue: 95,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Umidade",
                texto: expect.stringContaining("Umidade muito alta."),
            }),
        );
    });

    it("deve gerar texto específico para alerta de umidade abaixo do mínimo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 12, idTypeParam: 4 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 55 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 8,
            idTypeParam: 4,
            minExpected: 20,
            maxExpected: 80,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 4,
            json_key: "humidity",
            name: "Umidade",
            unit: "%",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 107 });

        await service.evaluateMeasurement({
            parameterId: 12,
            measuredValue: 10,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Umidade",
                texto: expect.stringContaining("Umidade muito baixa."),
            }),
        );
    });

    it("deve gerar texto genérico (fallback) para parâmetro não mapeado", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 13, idTypeParam: 5 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 56 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 9,
            idTypeParam: 5,
            minExpected: 900,
            maxExpected: 1100,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 5,
            json_key: "pressure",
            name: "Pressão Atmosférica",
            unit: "hPa",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 108 });

        await service.evaluateMeasurement({
            parameterId: 13,
            measuredValue: 1200,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta Automático",
                texto: expect.stringContaining("acima do limite configurado"),
            }),
        );
    });

    it("deve aplicar filtros individuais ao listar alertas - stationId e parameterId", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[], 0]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        await service.listAlerts({ stationId: 1, parameterId: 5 });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            "parameter.idStation = :stationId",
            { stationId: 1 },
        );
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            "parameter.id = :parameterId",
            { parameterId: 5 },
        );
    });

    it("deve aplicar filtro de idTypeParam ao listar alertas", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[], 0]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        await service.listAlerts({ idTypeParam: 3 });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            "parameter.idTypeParam = :idTypeParam",
            { idTypeParam: 3 },
        );
    });

    it("deve aplicar filtro de user ao listar alertas", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[], 0]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        await service.listAlerts({ user: "admin" });

        expect(queryBuilderMock.andWhere).toHaveBeenCalled();
        expect(queryBuilderMock.getManyAndCount).toHaveBeenCalledOnce();
    });

    it("deve aplicar filtros de data ao listar alertas", async () => {
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoinAndMapOne: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            skip: vi.fn().mockReturnThis(),
            take: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getManyAndCount: vi.fn().mockResolvedValueOnce([[], 0]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const from = new Date("2026-01-01");
        const to = new Date("2026-12-31");

        await service.listAlerts({ from, to });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            "alert.triggeredAt >= :from",
            { from },
        );
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            "alert.triggeredAt <= :to",
            { to },
        );
    });

    it("deve retornar false ao deletar alerta inexistente", async () => {
        const service = new AlertService();

        alertRepositoryMock.findOne.mockResolvedValueOnce(null);

        const result = await service.deleteAlert(999);

        expect(alertRepositoryMock.remove).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it("deve retornar array vazio quando não há limites configurados", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 60 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce(null);
        parameterLimitsRepositoryMock.find.mockResolvedValueOnce([]);

        const generated = await service.evaluateMeasurement({
            parameterId: 7,
            measuredValue: 40,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).not.toHaveBeenCalled();
        expect(generated).toHaveLength(0);
    });

    it("deve usar o fallback de find caso findOne nao retorne limites", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 60 });
        
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce(null);
        parameterLimitsRepositoryMock.find.mockResolvedValueOnce([
            { id: 5, idTypeParam: 1, minExpected: 0, maxExpected: 35 }
        ]);

        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce(null);
        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 30 });

        const generated = await service.evaluateMeasurement({
            parameterId: 7,
            measuredValue: 40,
            occurredAt: "2026-03-28T10:00:00.000Z",
        });

        expect(parameterLimitsRepositoryMock.find).toHaveBeenCalled();
        expect(generated).toHaveLength(1);
    });

    it("deve gerar alerta automático quando medição estiver abaixo do mínimo", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 61 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 5,
            idTypeParam: 1,
            minExpected: 10,
            maxExpected: 35,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce({
            id: 1,
            json_key: "temperature_2m",
            name: "Temperatura",
            unit: "°C",
        });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 109 });

        const generated = await service.evaluateMeasurement({
            parameterId: 7,
            measuredValue: 3,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta de Temperatura",
                texto: expect.stringContaining("Temperatura muito baixa."),
            }),
        );
        expect(generated).toHaveLength(1);
    });

    it("deve gerar alerta com texto fallback quando parameterType é null", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 14, idTypeParam: 99 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 70 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 10,
            idTypeParam: 99,
            minExpected: 0,
            maxExpected: 100,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce(null);

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 110 });

        const generated = await service.evaluateMeasurement({
            parameterId: 14,
            measuredValue: 150,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta Automático",
                texto: expect.stringContaining("Parâmetro está acima do limite configurado"),
            }),
        );
        expect(generated).toHaveLength(1);
    });

    it("deve gerar alerta com texto fallback 'abaixo' quando parameterType é null e valor abaixo do min", async () => {
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 15, idTypeParam: 99 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 71 });
        parameterLimitsRepositoryMock.findOne.mockResolvedValueOnce({
            id: 11,
            idTypeParam: 99,
            minExpected: 50,
            maxExpected: 100,
        });
        parameterTypeRepositoryMock.findOneBy.mockResolvedValueOnce(null);

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 111 });

        const generated = await service.evaluateMeasurement({
            parameterId: 15,
            measuredValue: 10,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: "Alerta Automático",
                texto: expect.stringContaining("abaixo do limite configurado"),
            }),
        );
        expect(generated).toHaveLength(1);
    });
});
