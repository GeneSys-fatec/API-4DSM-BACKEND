import { describe, expect, it, vi, beforeEach } from "vitest";
import { measurementsController } from "../../src/controllers/measurementsController.js";
import { dashboardService } from "../../src/services/measurementsService.js";

// Mock do Service
vi.mock("../../src/services/measurementsService.js", () => ({
    dashboardService: {
        getMeasurements: vi.fn(),
        getAggregations: vi.fn(),
    },
}));

function makeReply() {
    const reply: any = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    };
    return reply;
}

function makeRequest(query: any = {}) {
    return {
        query,
        log: {
            error: vi.fn(),
        },
    } as any;
}

describe("MeasurementsController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve retornar medições com sucesso (getMeasurements)", async () => {
        const reply = makeReply();
        const request = makeRequest({ stationId: "1", page: "2", limit: "50" });
        
        vi.mocked(dashboardService.getMeasurements).mockResolvedValueOnce({
            data: [], total: 0, page: 2, limit: 50, totalPages: 0
        });

        await measurementsController.getMeasurements(request, reply);

        expect(dashboardService.getMeasurements).toHaveBeenCalledWith({
            stationId: 1, page: 2, limit: 50
        });
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve retornar erro 500 caso o service falhe em getMeasurements", async () => {
        const reply = makeReply();
        const request = makeRequest({});
        
        vi.mocked(dashboardService.getMeasurements).mockRejectedValueOnce(new Error("DB Error"));

        await measurementsController.getMeasurements(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
        expect(reply.send).toHaveBeenCalledWith({ message: "Erro interno ao buscar medições." });
    });

    it("deve retornar agregações com sucesso (getAggregations)", async () => {
        const reply = makeReply();
        const request = makeRequest({ period: "7d" });
        
        vi.mocked(dashboardService.getAggregations).mockResolvedValueOnce([]);

        await measurementsController.getAggregations(request, reply);

        expect(dashboardService.getAggregations).toHaveBeenCalledWith({ period: "7d" });
        expect(reply.send).toHaveBeenCalled();
    });

    it("deve retornar erro 500 caso o service falhe em getAggregations", async () => {
        const reply = makeReply();
        const request = makeRequest({});
        
        vi.mocked(dashboardService.getAggregations).mockRejectedValueOnce(new Error("DB Error"));

        await measurementsController.getAggregations(request, reply);

        expect(reply.status).toHaveBeenCalledWith(500);
    });

    it("deve usar valores padrão quando query params não forem enviados (getMeasurements e getAggregations)", async () => {
        const reply = makeReply();
        // Simulando uma requisição sem query params (sem page, limit, period, etc)
        const request = makeRequest({}); 
        
        vi.mocked(dashboardService.getMeasurements).mockResolvedValueOnce({
            data: [], total: 0, page: 1, limit: 100, totalPages: 0
        });

        await measurementsController.getMeasurements(request, reply);
        
        // Verifica se assumiu page 1 e limit 100
        expect(dashboardService.getMeasurements).toHaveBeenCalledWith({
            page: 1, limit: 100
        });

        vi.mocked(dashboardService.getAggregations).mockResolvedValueOnce([]);
        await measurementsController.getAggregations(request, reply);
        
        // Verifica se chamou com filtro vazio
        expect(dashboardService.getAggregations).toHaveBeenCalledWith({});
    });

    it("deve cobrir todas as ramificações lógicas de filtros opcionais simultaneamente", async () => {
        const reply = makeReply();
        // Simulando a requisição com todos os parâmetros preenchidos para ativar todos os ifs
        const request = makeRequest({ 
            stationId: "1", 
            parameterId: "5", 
            startDate: "2024-01-01", 
            endDate: "2024-01-31", 
            period: "7d", 
            page: "1", 
            limit: "10" 
        });
        
        vi.mocked(dashboardService.getMeasurements).mockResolvedValueOnce({} as any);
        await measurementsController.getMeasurements(request, reply);
        
        vi.mocked(dashboardService.getAggregations).mockResolvedValueOnce([] as any);
        await measurementsController.getAggregations(request, reply);
        
        expect(dashboardService.getMeasurements).toHaveBeenCalled();
        expect(dashboardService.getAggregations).toHaveBeenCalled();
    });
});