import { beforeEach, describe, expect, it, vi } from "vitest";

const alertServiceMock = {
    listAlerts: vi.fn(),
    createAlert: vi.fn(),
    updateAlert: vi.fn(),
    deleteAlert: vi.fn(),
    findAlertById: vi.fn(),
    evaluateMeasurement: vi.fn(),
};

vi.mock("../../src/services/alertService.js", () => {
    return {
        alertService: alertServiceMock,
    };
});

function makeReply() {
    const reply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    };
    return reply;
}

describe("AlertController - Suporte a Alertas Climáticos", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve listar alertas cadastrados", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([
            {
                id: 1,
                idParameter: { id: 5 },
                idMeasurement: { id: 99 },
                triggeredValue: 40,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: "Temperatura alta",
                status: "active",
            },
        ]);

        await alertController.list({} as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledOnce();
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve validar campos obrigatórios no cadastro", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        await alertController.create(
            {
                body: {
                    parameterId: 1,
                    measuredValue: undefined,
                    occurredAt: "",
                    description: "",
                },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: "Fields 'parameterId', 'measuredValue', 'occurredAt' and 'description' are required",
        });
    });

    it("deve criar alerta e retornar 201", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.createAlert.mockResolvedValueOnce({ id: 10 });
        alertServiceMock.findAlertById.mockResolvedValueOnce({
            id: 10,
            idParameter: { id: 1 },
            idMeasurement: { id: 11 },
            triggeredValue: 40,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Temperatura alta",
            status: "active",
        });

        await alertController.create(
            {
                body: {
                    parameterId: 1,
                    measuredValue: 40,
                    occurredAt: "2026-03-28T10:00:00.000Z",
                    description: "Temperatura alta",
                },
            } as any,
            reply,
        );

        expect(alertServiceMock.createAlert).toHaveBeenCalled();
        expect(reply.status).toHaveBeenCalledWith(201);
    });

    it("deve retornar 404 ao tentar atualizar alerta inexistente", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.updateAlert.mockResolvedValueOnce(null);

        await alertController.update(
            {
                params: { id: "999" },
                body: { description: "Atualizado" },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(404);
        expect(reply.send).toHaveBeenCalledWith({ message: "Alert not found" });
    });

    it("deve remover alerta existente", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.deleteAlert.mockResolvedValueOnce(true);

        await alertController.delete({ params: { id: "10" } } as any, reply);

        expect(alertServiceMock.deleteAlert).toHaveBeenCalledWith(10);
        expect(reply.status).toHaveBeenCalledWith(204);
    });

    it("deve gerar alertas automaticamente no endpoint de avaliação", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.evaluateMeasurement.mockResolvedValueOnce([
            {
                id: 7,
                idParameter: { id: 1 },
                idMeasurement: { id: 12 },
                triggeredValue: 42,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: "Alerta automático",
                status: "active",
            },
        ]);

        await alertController.evaluate(
            {
                body: {
                    parameterId: 1,
                    measuredValue: 42,
                    occurredAt: "2026-03-28T10:00:00.000Z",
                },
            } as any,
            reply,
        );

        expect(alertServiceMock.evaluateMeasurement).toHaveBeenCalledWith({
            parameterId: 1,
            measuredValue: 42,
            occurredAt: "2026-03-28T10:00:00.000Z",
        });
        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                generatedCount: 1,
            }),
        );
    });
});
