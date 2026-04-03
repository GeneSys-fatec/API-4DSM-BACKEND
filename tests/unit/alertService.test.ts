import { beforeEach, describe, expect, it, vi } from "vitest";

const alertRepositoryMock = vi.hoisted(() => ({
    find: vi.fn(),
    findOne: vi.fn(),
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
});
