import { describe, it, expect, vi, beforeEach } from "vitest";
import { alertEvaluationService } from "../../src/services/alertEvaluationService.js";

const alertRepositoryMock = vi.hoisted(() => ({
    create: vi.fn(),
    save: vi.fn(),
}));
const limitsRepositoryMock = vi.hoisted(() => ({
    findOne: vi.fn(),
}));
const parameterRepositoryMock = vi.hoisted(() => ({
    findOneBy: vi.fn(),
}));
const stationRepositoryMock = vi.hoisted(() => ({
    findOneBy: vi.fn(),
}));
const paramTypeRepositoryMock = vi.hoisted(() => ({
    findOneBy: vi.fn(),
}));

vi.mock("../../src/data-source.js", () => ({
    AppDataSource: {
        getRepository: (entity: any) => {
            if (entity.name === "AlertLogEntity") return alertRepositoryMock;
            if (entity.name === "parameterLimitsEntity") return limitsRepositoryMock;
            if (entity.name === "ParameterEntity") return parameterRepositoryMock;
            if (entity.name === "StationEntity") return stationRepositoryMock;
            if (entity.name === "parameterTypeEntity") return paramTypeRepositoryMock;
            return { create: vi.fn(), save: vi.fn(), findOneBy: vi.fn(), findOne: vi.fn() };
        }
    }
}));

const emitMock = vi.hoisted(() => vi.fn());
vi.mock("../../src/services/alertService.js", () => ({
    alertNotificationEmitter: {
        emit: emitMock
    }
}));

describe("AlertEvaluationService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve retornar se parameterId for indefinido ou null", async () => {
        await alertEvaluationService.evaluate({ id: 1, value: 50, idParameter: null } as any);
        expect(parameterRepositoryMock.findOneBy).not.toHaveBeenCalled();
    });

    it("deve retornar se o parametro nao for encontrado no banco", async () => {
        parameterRepositoryMock.findOneBy.mockResolvedValueOnce(null);
        await alertEvaluationService.evaluate({ id: 1, value: 50, idParameter: 99 } as any);
        expect(limitsRepositoryMock.findOne).not.toHaveBeenCalled();
    });

    it("deve retornar se nao houver limite configurado para o tipo de parametro", async () => {
        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 99, idTypeParam: 2 });
        limitsRepositoryMock.findOne.mockResolvedValueOnce(null);
        await alertEvaluationService.evaluate({ id: 1, value: 50, idParameter: { id: 99 } } as any);
        expect(alertRepositoryMock.create).not.toHaveBeenCalled();
    });

    it("deve gerar alerta quando o valor for MENOR que o limite minimo", async () => {
        
        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 99, idTypeParam: { id: 2 }, idStation: 5 });
        limitsRepositoryMock.findOne.mockResolvedValueOnce({ minExpected: 10, maxExpected: 40 });
        stationRepositoryMock.findOneBy.mockResolvedValueOnce({ name: "Estação A" });
        paramTypeRepositoryMock.findOneBy.mockResolvedValueOnce({ name: "Temperatura" });

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 123, triggeredAt: new Date() });

        await alertEvaluationService.evaluate({ id: 1, value: 5, idParameter: 99, collectedAt: new Date() } as any);

        expect(alertRepositoryMock.save).toHaveBeenCalled();
        expect(emitMock).toHaveBeenCalledWith("alertTriggered", expect.objectContaining({
            id: 123,
            stationName: "Estação A",
            parameterName: "Temperatura",
            measuredValue: 5,
            configuredLimit: 10,
        }));
    });

    it("deve gerar alerta quando o valor for MAIOR que o limite maximo, tratando falhas nas buscas auxiliares", async () => {
        
        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 99, idTypeParam: 2, idStation: { id: 5 } });
        limitsRepositoryMock.findOne.mockResolvedValueOnce({ minExpected: 10, maxExpected: 40 });
        stationRepositoryMock.findOneBy.mockResolvedValueOnce(null);
        paramTypeRepositoryMock.findOneBy.mockResolvedValueOnce(null);

        alertRepositoryMock.create.mockReturnValueOnce({ id: 0 });
        alertRepositoryMock.save.mockResolvedValueOnce({ id: 124, triggeredAt: new Date() });

        await alertEvaluationService.evaluate({ id: 1, value: 45, idParameter: 99 } as any);

        expect(alertRepositoryMock.save).toHaveBeenCalled();
        expect(emitMock).toHaveBeenCalledWith("alertTriggered", expect.objectContaining({
            id: 124,
            stationName: "Estação Desconhecida",
            parameterName: "Parâmetro Desconhecido",
            measuredValue: 45,
            configuredLimit: 40,
        }));
    });

    it("nao deve gerar alerta quando o valor estiver dentro dos limites", async () => {
        
        parameterRepositoryMock.findOneBy.mockResolvedValueOnce({ id: 99, idTypeParam: 2 });
        limitsRepositoryMock.findOne.mockResolvedValueOnce({ minExpected: 10, maxExpected: 40 });

        await alertEvaluationService.evaluate({ id: 1, value: 25, idParameter: 99 } as any);

        expect(alertRepositoryMock.save).not.toHaveBeenCalled();
        expect(emitMock).not.toHaveBeenCalled();
    });

    it("deve ignorar o erro caso ocorra excecao durante a avaliacao", async () => {
        parameterRepositoryMock.findOneBy.mockRejectedValueOnce(new Error("DB Connection Error"));
        
        await alertEvaluationService.evaluate({ id: 1, value: 25, idParameter: 99 } as any);

        expect(alertRepositoryMock.save).not.toHaveBeenCalled();
    });
});