import { beforeEach, describe, expect, it, vi } from "vitest";

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
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
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

    it("deve criar alerta com associação entre parâmetro e medição", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 5, idTypeParam: 2 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 15, value: 16 });
        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 10, triggeredValue: 16 });

        const result = await service.createAlert({
            parameterId: 5,
            measuredValue: 16,
            occurredAt: "2026-03-28T20:10:00.000Z",
            description: "Umidade baixa",
        });

        expect(measurementRepositoryMock.create).toHaveBeenCalled();
        expect(alertRepositoryMock.create).toHaveBeenCalled();
        expect(result).toEqual({ id: 10, triggeredValue: 16 });
    });

    it("deve recusar criação de alerta para parâmetro inexistente", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce(null);

        await expect(
            service.createAlert({
                parameterId: 999,
                measuredValue: 10,
                occurredAt: "2026-03-28T20:10:00.000Z",
                description: "Teste",
            }),
        ).rejects.toThrow("Parameter not found");
    });

    it("deve listar histórico de alertas", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        alertRepositoryMock.find.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);

        const result = await service.listAlerts();

        expect(alertRepositoryMock.find).toHaveBeenCalled();
        expect(result).toHaveLength(2);
    });

    it("deve aplicar filtros ao listar histórico de alertas", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([{ id: 33 }]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const result = await service.listAlerts({ status: "active", q: "temperatura" });

        expect(alertRepositoryMock.createQueryBuilder).toHaveBeenCalledWith("alert");
        expect(queryBuilderMock.getMany).toHaveBeenCalledOnce();
        expect(result).toEqual([{ id: 33 }]);
    });

    it("deve retornar null ao atualizar alerta inexistente", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        alertRepositoryMock.findOne.mockResolvedValueOnce(null);

        const result = await service.updateAlert(123, { description: "Atualizado" });

        expect(result).toBeNull();
    });

    it("deve remover alerta existente", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        alertRepositoryMock.findOne.mockResolvedValueOnce({ id: 10 });
        alertRepositoryMock.remove.mockResolvedValueOnce(undefined);

        const result = await service.deleteAlert(10);

        expect(alertRepositoryMock.remove).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it("deve gerar alerta automático quando medição ultrapassar limite configurado", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 21 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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

        expect(parameterLimitsRepositoryMock.findOneBy).toHaveBeenCalled();
        expect(alertRepositoryMock.create).toHaveBeenCalled();
        expect(generated).toHaveLength(1);
    });

    it("não deve gerar alerta automático quando medição estiver na faixa", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 21 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 99 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 9, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 99 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 10, idTypeParam: 2 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 50 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 10, idTypeParam: 2 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 51 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 11, idTypeParam: 3 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 52 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 11, idTypeParam: 3 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 53 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 12, idTypeParam: 4 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 54 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 12, idTypeParam: 4 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 55 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 13, idTypeParam: 5 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 56 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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

    it("deve lançar erro ao criar alerta com data inválida", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 5, idTypeParam: 2 });

        await expect(
            service.createAlert({
                parameterId: 5,
                measuredValue: 16,
                occurredAt: "invalid-date",
                description: "Teste data inválida",
            }),
        ).rejects.toThrow("Invalid occurredAt");
    });

    it("deve aplicar filtros individuais ao listar alertas - stationId e parameterId", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
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
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        await service.listAlerts({ idTypeParam: 3 });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            "parameter.idTypeParam = :idTypeParam",
            { idTypeParam: 3 },
        );
    });

    it("deve aplicar filtro de user ao listar alertas", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
        };

        alertRepositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        await service.listAlerts({ user: "admin" });

        expect(queryBuilderMock.andWhere).toHaveBeenCalled();
        expect(queryBuilderMock.getMany).toHaveBeenCalledOnce();
    });

    it("deve aplicar filtros de data ao listar alertas", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const queryBuilderMock = {
            leftJoinAndSelect: vi.fn().mockReturnThis(),
            leftJoin: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
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

    it("deve atualizar alerta existente com todos os campos", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const existingAlert = {
            id: 10,
            idParameter: { id: 1 },
            idMeasurement: {
                id: 20,
                idParameter: { id: 1 },
                rawValue: 30,
                value: 30,
                collectedAt: new Date("2026-03-28T10:00:00.000Z"),
            },
            triggeredValue: 30,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Original",
            status: "active",
            resolvedAt: null,
        };

        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 2, idTypeParam: 1 });
        measurementRepositoryMock.save.mockResolvedValueOnce(existingAlert.idMeasurement);
        alertRepositoryMock.save.mockResolvedValueOnce({
            ...existingAlert,
            idParameter: { id: 2 },
            triggeredValue: 45,
            triggeredAt: new Date("2026-04-01T10:00:00.000Z"),
            texto: "Atualizado",
            status: "resolved",
        });

        const result = await service.updateAlert(10, {
            parameterId: 2,
            measuredValue: 45,
            occurredAt: "2026-04-01T10:00:00.000Z",
            description: "Atualizado",
            status: "resolved",
        });

        expect(parameterRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: 2 });
        expect(measurementRepositoryMock.save).toHaveBeenCalled();
        expect(alertRepositoryMock.save).toHaveBeenCalled();
        expect(result).toBeTruthy();
    });

    it("deve retornar false ao deletar alerta inexistente", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        alertRepositoryMock.findOne.mockResolvedValueOnce(null);

        const result = await service.deleteAlert(999);

        expect(alertRepositoryMock.remove).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it("deve retornar array vazio quando não há limites configurados", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 60 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce(null);

        const generated = await service.evaluateMeasurement({
            parameterId: 7,
            measuredValue: 40,
            occurredAt: "2026-03-28T20:10:00.000Z",
        });

        expect(alertRepositoryMock.create).not.toHaveBeenCalled();
        expect(generated).toHaveLength(0);
    });

    it("deve gerar alerta automático quando medição estiver abaixo do mínimo", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 7, idTypeParam: 1 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 61 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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

    // BRANCH: updateAlert com apenas description (sem parameterId, measuredValue, occurredAt, status)
    it("deve atualizar alerta apenas com description", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const existingAlert = {
            id: 10,
            idParameter: { id: 1 },
            idMeasurement: {
                id: 20,
                idParameter: { id: 1 },
                rawValue: 30,
                value: 30,
                collectedAt: new Date("2026-03-28T10:00:00.000Z"),
            },
            triggeredValue: 30,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Original",
            status: "active",
            resolvedAt: null,
        };

        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        measurementRepositoryMock.save.mockResolvedValueOnce(existingAlert.idMeasurement);
        alertRepositoryMock.save.mockResolvedValueOnce({
            ...existingAlert,
            texto: "Novo texto",
        });

        const result = await service.updateAlert(10, { description: "Novo texto" });

        expect(result).toBeTruthy();
        expect(existingAlert.texto).toBe("Novo texto");
        expect(measurementRepositoryMock.save).toHaveBeenCalled();
        expect(alertRepositoryMock.save).toHaveBeenCalled();
    });

    // BRANCH: updateAlert com apenas status "active" (resolvedAt deve ser null)
    it("deve atualizar alerta com status active e resolvedAt como null", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const existingAlert = {
            id: 11,
            idParameter: { id: 1 },
            idMeasurement: {
                id: 21,
                idParameter: { id: 1 },
                rawValue: 40,
                value: 40,
                collectedAt: new Date("2026-03-28T10:00:00.000Z"),
            },
            triggeredValue: 40,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Alerta",
            status: "resolved",
            resolvedAt: new Date(),
        };

        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        measurementRepositoryMock.save.mockResolvedValueOnce(existingAlert.idMeasurement);
        alertRepositoryMock.save.mockResolvedValueOnce({
            ...existingAlert,
            status: "active",
            resolvedAt: null,
        });

        const result = await service.updateAlert(11, { status: "active" });

        expect(result).toBeTruthy();
        expect(existingAlert.status).toBe("active");
        expect(existingAlert.resolvedAt).toBeNull();
    });

    // BRANCH: updateAlert com apenas occurredAt
    it("deve atualizar alerta apenas com occurredAt", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const existingAlert = {
            id: 12,
            idParameter: { id: 1 },
            idMeasurement: {
                id: 22,
                idParameter: { id: 1 },
                rawValue: 30,
                value: 30,
                collectedAt: new Date("2026-03-28T10:00:00.000Z"),
            },
            triggeredValue: 30,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Teste",
            status: "active",
            resolvedAt: null,
        };

        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        measurementRepositoryMock.save.mockResolvedValueOnce(existingAlert.idMeasurement);
        alertRepositoryMock.save.mockResolvedValueOnce({
            ...existingAlert,
            triggeredAt: new Date("2026-05-01T12:00:00.000Z"),
        });

        const result = await service.updateAlert(12, { occurredAt: "2026-05-01T12:00:00.000Z" });

        expect(result).toBeTruthy();
        expect(existingAlert.triggeredAt).toEqual(new Date("2026-05-01T12:00:00.000Z"));
        expect(existingAlert.idMeasurement.collectedAt).toEqual(new Date("2026-05-01T12:00:00.000Z"));
    });

    // BRANCH: updateAlert com apenas measuredValue
    it("deve atualizar alerta apenas com measuredValue", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const existingAlert = {
            id: 13,
            idParameter: { id: 1 },
            idMeasurement: {
                id: 23,
                idParameter: { id: 1 },
                rawValue: 30,
                value: 30,
                collectedAt: new Date("2026-03-28T10:00:00.000Z"),
            },
            triggeredValue: 30,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Teste",
            status: "active",
            resolvedAt: null,
        };

        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        measurementRepositoryMock.save.mockResolvedValueOnce(existingAlert.idMeasurement);
        alertRepositoryMock.save.mockResolvedValueOnce({
            ...existingAlert,
            triggeredValue: 55,
        });

        const result = await service.updateAlert(13, { measuredValue: 55 });

        expect(result).toBeTruthy();
        expect(existingAlert.triggeredValue).toBe(55);
        expect(existingAlert.idMeasurement.rawValue).toBe(55);
        expect(existingAlert.idMeasurement.value).toBe(55);
    });

    // BRANCH: evaluateMeasurement com parameterType null (fallback no buildAutomaticMessage)
    it("deve gerar alerta com texto fallback quando parameterType é null", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 14, idTypeParam: 99 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 70 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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

    // BRANCH: evaluateMeasurement com parameterType null e abaixo do mínimo
    it("deve gerar alerta com texto fallback 'abaixo' quando parameterType é null e valor abaixo do min", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 15, idTypeParam: 99 });
        measurementRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        measurementRepositoryMock.save.mockResolvedValueOnce({ id: 71 });
        parameterLimitsRepositoryMock.findOneBy.mockResolvedValueOnce({
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

    // BRANCH: updateAlert com status "resolved" (resolvedAt deve ser preenchido)
    it("deve atualizar alerta com status resolved e preencher resolvedAt", async () => {
        const { AlertService } = await import("../../src/services/alertService.js");
        const service = new AlertService();

        const existingAlert = {
            id: 14,
            idParameter: { id: 1 },
            idMeasurement: {
                id: 24,
                idParameter: { id: 1 },
                rawValue: 40,
                value: 40,
                collectedAt: new Date("2026-03-28T10:00:00.000Z"),
            },
            triggeredValue: 40,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Alerta",
            status: "active",
            resolvedAt: null,
        };

        alertRepositoryMock.findOne.mockResolvedValueOnce(existingAlert);
        measurementRepositoryMock.save.mockResolvedValueOnce(existingAlert.idMeasurement);
        alertRepositoryMock.save.mockResolvedValueOnce({
            ...existingAlert,
            status: "resolved",
            resolvedAt: new Date(),
        });

        const result = await service.updateAlert(14, { status: "resolved" });

        expect(result).toBeTruthy();
        expect(existingAlert.status).toBe("resolved");
        expect(existingAlert.resolvedAt).toBeInstanceOf(Date);
    });
});

