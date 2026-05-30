import { beforeEach, describe, expect, it, vi } from "vitest";

const alertServiceMock = {
    listAlerts: vi.fn(),
    deleteAlert: vi.fn(),
    findAlertById: vi.fn(),
    evaluateMeasurement: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    clearReadAlerts: vi.fn(),
};

vi.mock("../../src/services/alertService.js", () => {
    return {
        alertService: alertServiceMock,
        alertNotificationEmitter: {
            on: vi.fn(),
            off: vi.fn(),
        },
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

        alertServiceMock.listAlerts.mockResolvedValueOnce({
            data: [{
                id: 1,
                idParameter: { id: 5 },
                idMeasurement: { id: 99 },
                triggeredValue: 40,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: "Temperatura alta",
                status: "active",
            }], total: 1, page: 1, limit: 1000, totalPages: 1
        });

        await alertController.list({ query: {} } as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith({});
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve passar parâmetros de filtro na listagem", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });

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
        expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
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

    it("deve retornar 400 quando request.body é undefined no evaluate", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        await alertController.evaluate({} as any, reply);

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

    it("deve retornar 400 e Unknown error se evaluateMeasurement lançar exceção sem message", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.evaluateMeasurement.mockRejectedValueOnce({});

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
        expect(reply.send).toHaveBeenCalledWith({ message: "Unknown error" });
    });

    // BRANCH: mapAlertResponse com titulo (quando texto é null/undefined)
    it("deve usar titulo como fallback na description quando texto é null", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({
            data: [{
                id: 1,
                idParameter: { id: 5 },
                idMeasurement: { id: 99 },
                triggeredValue: 40,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: null,
                titulo: "Alerta de Temperatura",
                status: "active",
            }], total: 1, page: 1, limit: 1000, totalPages: 1
        });

        await alertController.list({ query: {} } as any, reply);

        expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ data: [
            expect.objectContaining({
                description: "Alerta de Temperatura",
            }),
        ]}));
    });

    // BRANCH: mapAlertResponse com texto e titulo ambos null → fallback ""
    it("deve usar string vazia como fallback quando texto e titulo são null", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({
            data: [{
                id: 2,
                idParameter: { id: 6 },
                idMeasurement: { id: 100 },
                triggeredValue: 50,
                triggeredAt: new Date("2026-03-28T10:00:00.000Z"),
                texto: null,
                titulo: null,
                status: "active",
            }], total: 1, page: 1, limit: 1000, totalPages: 1
        });

        await alertController.list({ query: {} } as any, reply);

        expect(reply.send).toHaveBeenCalledWith(expect.objectContaining({ data: [
            expect.objectContaining({
                description: "",
            }),
        ]}));
    });

    // BRANCH: list com filtros individuais: parameterId, idTypeParam, user, from, to
    it("deve passar filtros parameterId, idTypeParam, user, from e to na listagem", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });

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

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });

        await alertController.list({ query: undefined } as any, reply);

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith({});
    });

    // BRANCH: list com apenas user como filtro
    it("deve passar apenas o filtro user na listagem", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });

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

    it("deve passar filtro q na listagem de alertas", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });

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

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });

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

    it("deve passar isRead, page e limit na listagem de alertas", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 2, limit: 20, totalPages: 0 });

        await alertController.list(
            {
                query: {
                    isRead: "true",
                    page: "2",
                    limit: "20",
                },
            } as any,
            reply,
        );

        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(
            expect.objectContaining({
                isRead: true,
                page: 2,
                limit: 20,
            }),
        );

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [], total: 0, page: 1, limit: 1000, totalPages: 0 });
        await alertController.list({ query: { isRead: true } } as any, reply);
        expect(alertServiceMock.listAlerts).toHaveBeenCalledWith(expect.objectContaining({ isRead: true }));
    });

    it("deve lançar erro se ocorrer falha ao listar alertas", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.listAlerts.mockRejectedValueOnce(new Error("DB Error"));

        await expect(alertController.list({ query: {} } as any, reply)).rejects.toThrow("DB Error");
    });

    it("deve marcar um alerta como lido", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.markAsRead.mockResolvedValueOnce(true);

        await alertController.markAsRead({ params: { id: "1" } } as any, reply);

        expect(alertServiceMock.markAsRead).toHaveBeenCalledWith(1);
        expect(reply.status).toHaveBeenCalledWith(204);
    });

    it("deve retornar 404 quando não encontrar o alerta para marcar como lido", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.markAsRead.mockResolvedValueOnce(false);

        await alertController.markAsRead({ params: { id: "99" } } as any, reply);

        expect(reply.status).toHaveBeenCalledWith(404);
    });

    it("deve retornar 500 com mensagem padrão se ocorrer erro sem message ao marcar todos os alertas como lidos", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.markAllAsRead.mockRejectedValueOnce({}); 

        await alertController.markAllAsRead({} as any, reply);
        expect(reply.status).toHaveBeenCalledWith(500);
    });

    it("deve retornar 400 se o id for inválido em markAsRead", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();

        await alertController.markAsRead({ params: { id: "abc" } } as any, reply);

        expect(reply.status).toHaveBeenCalledWith(400);
    });

    it("deve lançar erro se ocorrer falha ao marcar alerta como lido", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.markAsRead.mockRejectedValueOnce(new Error("DB Error"));

        await expect(alertController.markAsRead({ params: { id: "1" } } as any, reply)).rejects.toThrow("DB Error");
    });

    it("deve marcar todos os alertas como lidos", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.markAllAsRead.mockResolvedValueOnce(true);

        await alertController.markAllAsRead({} as any, reply);

        expect(alertServiceMock.markAllAsRead).toHaveBeenCalled();
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve retornar 500 se ocorrer erro ao marcar todos os alertas como lidos", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.markAllAsRead.mockRejectedValueOnce(new Error("DB Error"));

        await alertController.markAllAsRead({} as any, reply);
        expect(reply.status).toHaveBeenCalledWith(500);
    });

    it("deve limpar alertas lidos", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.clearReadAlerts.mockResolvedValueOnce(3);

        const clearMethod = (alertController as any).clear || (alertController as any).clearRead || (alertController as any).clearReadAlerts;
        await clearMethod.call(alertController, {} as any, reply);

        expect(alertServiceMock.clearReadAlerts).toHaveBeenCalled();
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve retornar 500 com mensagem padrão se ocorrer erro sem message ao limpar alertas lidos", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.clearReadAlerts.mockRejectedValueOnce({});

        const clearMethod = (alertController as any).clear || (alertController as any).clearRead || (alertController as any).clearReadAlerts;
        await clearMethod.call(alertController, {} as any, reply);
        expect(reply.status).toHaveBeenCalledWith(500);
    });

    it("deve retornar 500 se ocorrer erro ao limpar alertas lidos", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.clearReadAlerts.mockRejectedValueOnce(new Error("DB Error"));

        const clearMethod = (alertController as any).clear || (alertController as any).clearRead || (alertController as any).clearReadAlerts;
        await clearMethod.call(alertController, {} as any, reply);
        expect(reply.status).toHaveBeenCalledWith(500);
    });

    it("deve lançar erro se ocorrer falha ao deletar alerta", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        alertServiceMock.deleteAlert.mockRejectedValueOnce(new Error("DB Error"));

        await expect(alertController.delete({ params: { id: "10" } } as any, reply)).rejects.toThrow("DB Error");
    });

    it("deve gerenciar conexões SSE na rota stream e fechar corretamente", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const { alertNotificationEmitter } = await import("../../src/services/alertService.js");
        const reply = makeReply();
        
        reply.raw = {
            writeHead: vi.fn(),
            write: vi.fn(),
        };
        reply.hijack = vi.fn();

        let closeCallback: any;
        const request = {
            raw: {
                on: vi.fn((event, cb) => {
                    if (event === "close") closeCallback = cb;
                }),
            },
        };

        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [] });

        await alertController.stream(request as any, reply);

        expect(reply.raw.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
            "Content-Type": "text/event-stream"
        }));
        expect(reply.hijack).toHaveBeenCalled();
        expect(alertNotificationEmitter.on).toHaveBeenCalledWith("alertTriggered", expect.any(Function));

        closeCallback();
        expect(alertNotificationEmitter.off).toHaveBeenCalledWith("alertTriggered", expect.any(Function));
    });

    it("deve escrever alertas não lidos ao inicializar o stream", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        reply.raw = { writeHead: vi.fn(), write: vi.fn() };
        reply.hijack = vi.fn();
        const request = { raw: { on: vi.fn() } };

        alertServiceMock.listAlerts.mockResolvedValueOnce({
            data: [{ id: 1, isRead: false }]
        });

        await alertController.stream(request as any, reply);
        expect(reply.raw.write).toHaveBeenCalledWith(expect.stringContaining("data:"));
    });

    it("deve ignorar erro ao buscar alertas não lidos na inicialização do stream", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const reply = makeReply();
        reply.raw = { writeHead: vi.fn(), write: vi.fn() };
        reply.hijack = vi.fn();
        const request = { raw: { on: vi.fn() } };
        
        alertServiceMock.listAlerts.mockRejectedValueOnce(new Error("Erro interno"));
        
        await alertController.stream(request as any, reply);

        expect(reply.raw.write).not.toHaveBeenCalled();
        expect(reply.hijack).toHaveBeenCalled();
    });

    it("deve enviar evento SSE quando alertTriggered for emitido", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const { alertNotificationEmitter } = await import("../../src/services/alertService.js");
        const reply = makeReply();
        reply.raw = { writeHead: vi.fn(), write: vi.fn() };
        reply.hijack = vi.fn();

        const request = { raw: { on: vi.fn() } };
        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [] });
        await alertController.stream(request as any, reply);

        const emitCallback = (alertNotificationEmitter.on as any).mock.calls[0][1];
        emitCallback({ id: 1, texto: "Novo alerta" });

        expect(reply.raw.write).toHaveBeenCalledWith(expect.stringContaining("Novo alerta"));
    });

    it("deve escrever o evento recebido com stationName diretamente na rota stream", async () => {
        const { alertController } = await import("../../src/controllers/alertController.js");
        const { alertNotificationEmitter } = await import("../../src/services/alertService.js");
        const reply = makeReply();
        reply.raw = { writeHead: vi.fn(), write: vi.fn() };
        reply.hijack = vi.fn();
        const request = { raw: { on: vi.fn() } };
        alertServiceMock.listAlerts.mockResolvedValueOnce({ data: [] });
        await alertController.stream(request as any, reply);
        const emitCallback = (alertNotificationEmitter.on as any).mock.calls[0][1];
        emitCallback({ id: 2, stationName: "Estacao", texto: "Alerta SSE" });
        expect(reply.raw.write).toHaveBeenCalledWith(`data: {"id":2,"stationName":"Estacao","texto":"Alerta SSE"}\n\n`);
    });
});
