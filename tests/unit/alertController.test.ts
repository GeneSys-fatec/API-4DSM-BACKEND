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

        await alertController.list({ query: {} } as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith({});
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve passar parâmetros de filtro na listagem", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([]);

        const request = {
            query: { stationId: "1", status: "active", from: "2026-01-01" },
        };

        await alertController.list(request as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(
            expect.objectContaining({
                stationId: 1,
                status: "active",
                from: expect.any(Date),
            })
        );
        expect(reply.send).toHaveBeenCalledWith([]);
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

    it("deve retornar 500 quando alerta criado não é encontrado após criação", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.createAlert.mockResolvedValueOnce({ id: 20 });
        alertServiceMock.findAlertById.mockResolvedValueOnce(null);

        await alertController.create(
            {
                body: {
                    parameterId: 1,
                    measuredValue: 30,
                    occurredAt: "2026-03-28T10:00:00.000Z",
                    description: "Teste criação",
                },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({ message: "Alert created but not found" });
    });

    it("deve retornar 400 quando createAlert lança exceção", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.createAlert.mockRejectedValueOnce(new Error("Parameter not found"));

        await alertController.create(
            {
                body: {
                    parameterId: 999,
                    measuredValue: 30,
                    occurredAt: "2026-03-28T10:00:00.000Z",
                    description: "Teste erro",
                },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({ message: "Parameter not found" });
    });

    it("deve retornar 400 quando id do update não é numérico", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        await alertController.update(
            {
                params: { id: "abc" },
                body: { description: "Teste" },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({ message: "Invalid alert id" });
    });

    it("deve atualizar alerta com sucesso e retornar dados mapeados", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        const updatedAlert = {
            id: 5,
            idParameter: { id: 2 },
            idMeasurement: { id: 50 },
            triggeredValue: 35,
            triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
            texto: "Atualizado",
            status: "resolved",
        };

        alertServiceMock.updateAlert.mockResolvedValueOnce({ id: 5 });
        alertServiceMock.findAlertById.mockResolvedValueOnce(updatedAlert);

        await alertController.update(
            {
                params: { id: "5" },
                body: { description: "Atualizado", status: "resolved" },
            } as any,
            reply,
        );

        expect(reply.send).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 5,
                parameterId: 2,
                status: "resolved",
            }),
        );
    });

    it("deve retornar 500 quando findAlertById retorna null após update", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.updateAlert.mockResolvedValueOnce({ id: 5 });
        alertServiceMock.findAlertById.mockResolvedValueOnce(null);

        await alertController.update(
            {
                params: { id: "5" },
                body: { description: "Teste" },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({ message: "Updated alert not found" });
    });

    it("deve retornar 400 quando updateAlert lança exceção", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.updateAlert.mockRejectedValueOnce(new Error("Invalid occurredAt"));

        await alertController.update(
            {
                params: { id: "5" },
                body: { occurredAt: "invalid-date" },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({ message: "Invalid occurredAt" });
    });

    it("deve retornar 400 quando id do delete não é numérico", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        await alertController.delete(
            { params: { id: "xyz" } } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({ message: "Invalid alert id" });
    });

    it("deve retornar 404 quando alerta não existe ao deletar", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.deleteAlert.mockResolvedValueOnce(false);

        await alertController.delete(
            { params: { id: "999" } } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(404);
        expect(reply.send).toHaveBeenCalledWith({ message: "Alert not found" });
    });

    it("deve retornar 400 quando campos obrigatórios do evaluate estão faltando", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        await alertController.evaluate(
            {
                body: {
                    parameterId: 0,
                    measuredValue: undefined,
                    occurredAt: "",
                },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({
            message: "Fields 'parameterId', 'measuredValue' and 'occurredAt' are required",
        });
    });

    it("deve retornar 400 quando evaluateMeasurement lança exceção", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.evaluateMeasurement.mockRejectedValueOnce(
            new Error("Parameter not found"),
        );

        await alertController.evaluate(
            {
                body: {
                    parameterId: 999,
                    measuredValue: 50,
                    occurredAt: "2026-03-28T10:00:00.000Z",
                },
            } as any,
            reply,
        );

        expect(reply.status).toHaveBeenCalledWith(400);
        expect(reply.send).toHaveBeenCalledWith({ message: "Parameter not found" });
    });

    // BRANCH: mapAlertResponse com titulo (quando texto é null/undefined)
    it("deve usar titulo como fallback na description quando texto é null", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([
            {
                id: 1,
                idParameter: { id: 5 },
                idMeasurement: { id: 99 },
                triggeredValue: 40,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: null,
                titulo: "Alerta de Temperatura",
                status: "active",
            },
        ]);

        await alertController.list({ query: {} } as any, reply);

        expect(reply.send).toHaveBeenCalledWith([
            expect.objectContaining({
                description: "Alerta de Temperatura",
            }),
        ]);
    });

    // BRANCH: mapAlertResponse com texto e titulo ambos null → fallback ""
    it("deve usar string vazia como fallback quando texto e titulo são null", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([
            {
                id: 2,
                idParameter: { id: 6 },
                idMeasurement: { id: 100 },
                triggeredValue: 50,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: null,
                titulo: null,
                status: "active",
            },
        ]);

        await alertController.list({ query: {} } as any, reply);

        expect(reply.send).toHaveBeenCalledWith([
            expect.objectContaining({
                description: "",
            }),
        ]);
    });

    // BRANCH: list com filtros individuais: parameterId, idTypeParam, user, from, to
    it("deve passar filtros parameterId, idTypeParam, user, from e to na listagem", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([]);

        const request = {
            query: {
                parameterId: "5",
                idTypeParam: "2",
                user: "admin",
                from: "2026-01-01",
                to: "2026-12-31",
            },
        };

        await alertController.list(request as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(
            expect.objectContaining({
                parameterId: 5,
                idTypeParam: 2,
                user: "admin",
                from: expect.any(Date),
                to: expect.any(Date),
            }),
        );
    });

    // BRANCH: list sem query (undefined)
    it("deve usar objeto vazio quando query é undefined", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([]);

        await alertController.list({ query: undefined } as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith({});
    });

    // BRANCH: update com todos os campos opcionais do body presentes
    it("deve construir payload com todos os campos opcionais no update", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        const updatedAlert = {
            id: 5,
            idParameter: { id: 2 },
            idMeasurement: { id: 50 },
            triggeredValue: 45,
            triggeredAt: new Date("2026-04-01T10:00:00.000Z"),
            texto: "Novo texto",
            status: "resolved",
        };

        alertServiceMock.updateAlert.mockResolvedValueOnce({ id: 5 });
        alertServiceMock.findAlertById.mockResolvedValueOnce(updatedAlert);

        await alertController.update(
            {
                params: { id: "5" },
                body: {
                    parameterId: 2,
                    measuredValue: 45,
                    occurredAt: "2026-04-01T10:00:00.000Z",
                    description: "Novo texto",
                    status: "resolved",
                },
            } as any,
            reply,
        );

        expect(alertServiceMock.updateAlert).toHaveBeenCalledWith(5, {
            parameterId: 2,
            measuredValue: 45,
            occurredAt: "2026-04-01T10:00:00.000Z",
            description: "Novo texto",
            status: "resolved",
        });
        expect(reply.send).toHaveBeenCalled();
    });

    // BRANCH: list com apenas user como filtro
    it("deve passar apenas o filtro user na listagem", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([]);

        await alertController.list(
            { query: { user: "operador" } } as any,
            reply,
        );

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(
            expect.objectContaining({
                user: "operador",
            }),
        );
    });

    // BRANCH: list com filtro q para cobrir linha 56
    it("deve passar filtro q na listagem de alertas", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([]);

        await alertController.list(
            { query: { q: "temperatura" } } as any,
            reply,
        );

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(
            expect.objectContaining({
                q: "temperatura",
            }),
        );
    });

    // BRANCH: list com todos os filtros combinados
    it("deve passar todos os filtros combinados na listagem de alertas", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce([]);

        await alertController.list(
            {
                query: {
                    q: "teste",
                    stationId: "1",
                    parameterId: "2",
                    idTypeParam: "3",
                    status: "resolved",
                    user: "admin",
                    from: "2026-01-01",
                    to: "2026-12-31",
                },
            } as any,
            reply,
        );

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(
            expect.objectContaining({
                q: "teste",
                stationId: 1,
                parameterId: 2,
                idTypeParam: 3,
                status: "resolved",
                user: "admin",
                from: expect.any(Date),
                to: expect.any(Date),
            }),
        );
    });
});

