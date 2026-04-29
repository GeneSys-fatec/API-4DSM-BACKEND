import { describe, it, expect, vi, beforeEach } from "vitest";
import { dashboardService } from "../../src/services/measurementsService";

// Fazendo o Mock (simulação) do TypeORM e do Banco de Dados
vi.mock("../../src/data-source.js", () => {
    const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        leftJoinAndMapOne: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        addGroupBy: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([
            [{ id: 1, value: 25.5, collectedAt: new Date() }],
            1
        ]),
        getRawMany: vi.fn().mockResolvedValue([
            {
                parameterId: "1",
                parameterName: "Temperatura do Ar",
                unit: "°C",
                avgValue: "25.50",
                maxValue: "30.00",
                minValue: "20.00",
                count: "150"
            }
        ])
    };

    return {
        AppDataSource: {
            getRepository: vi.fn().mockReturnValue({
                createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder)
            })
        }
    };
});

describe("Measurements Service", () => {
    it("deve retornar as medições paginadas corretamente", async () => {
        const filters = { stationId: 1, page: 1, limit: 10 };
        const result = await dashboardService.getMeasurements(filters);

        expect(result).toBeDefined();
        expect(result.total).toBe(1);
        expect(result.data).toHaveLength(1);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
        expect(result.totalPages).toBe(1);
    });

    it("deve aplicar atalhos de período (24h) na busca", async () => {
        const filters = { stationId: 1, period: "24h" as any };
        const result = await dashboardService.getMeasurements(filters);
        
        expect(result).toBeDefined();
        expect(result.data[0].value).toBe(25.5);
    });

    it("deve retornar agregações formatadas convertendo strings do PG para Number", async () => {
        const filters = { stationId: 1 };
        const result = await dashboardService.getAggregations(filters);

        expect(result).toHaveLength(1);
        expect(result[0].parameterName).toBe("Temperatura do Ar");
        
        // Verifica se a conversão de String para Number feita no service funcionou
        expect(typeof result[0].avgValue).toBe("number");
        expect(result[0].avgValue).toBe(25.5);
        expect(result[0].maxValue).toBe(30);
        expect(result[0].minValue).toBe(20);
        expect(result[0].count).toBe(150);
    });
});