import { beforeEach, describe, expect, it, vi } from "vitest";

const stationServiceMock = {
	findAll: vi.fn(),
	findForMap: vi.fn(),
	findByAddress: vi.fn(),
	findById: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};

vi.mock("../../src/services/stationService.js", () => ({
	stationService: stationServiceMock,
}));

function makeReply() {
	const reply: Record<string, ReturnType<typeof vi.fn>> = {
		status: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
	};
	return reply;
}

function makeMapStation(overrides: Record<string, unknown> = {}) {
	return {
		id: 1,
		name: "Estação Centro",
		address: "São Paulo, SP",
		latitude: "-23.5505",
		longitude: "-46.6333",
		isActive: true,
		idDatalogger: "DL-123",
		...overrides,
	};
}

describe("StationController.listMap — GET /stations/map", () => {
	beforeEach(() => vi.clearAllMocks());

	it("deve retornar a lista de estações do serviço findForMap", async () => {
		const { stationController } = await import("../../src/controllers/stationController.js");
		const stations = [makeMapStation(), makeMapStation({ id: 2, name: "Estação Norte" })];
		stationServiceMock.findForMap.mockResolvedValueOnce(stations);
		const reply = makeReply();

		await stationController.listMap({} as any, reply as any);

		expect(stationServiceMock.findForMap).toHaveBeenCalledOnce();
		expect(reply.send).toHaveBeenCalledWith(stations);
	});

	it("deve retornar array vazio quando não há estações com coordenadas", async () => {
		const { stationController } = await import("../../src/controllers/stationController.js");
		stationServiceMock.findForMap.mockResolvedValueOnce([]);
		const reply = makeReply();

		await stationController.listMap({} as any, reply as any);

		expect(reply.send).toHaveBeenCalledWith([]);
	});

	it("o payload deve conter apenas os campos necessários para o mapa", async () => {
		const { stationController } = await import("../../src/controllers/stationController.js");
		const stationData = makeMapStation();
		stationServiceMock.findForMap.mockResolvedValueOnce([stationData]);
		const reply = makeReply();

		await stationController.listMap({} as any, reply as any);

		const [sentData] = (reply.send as ReturnType<typeof vi.fn>).mock.calls[0] as [typeof stationData[]];
		expect(sentData[0]).toMatchObject({
			id: stationData.id,
			name: stationData.name,
			address: stationData.address,
			latitude: stationData.latitude,
			longitude: stationData.longitude,
			isActive: stationData.isActive,
			idDatalogger: stationData.idDatalogger,
		});
	});
});

describe("StationController.listPublic — GET /stations/public", () => {
	beforeEach(() => vi.clearAllMocks());

	it("deve retornar apenas estações ativas", async () => {
		const { stationController } = await import("../../src/controllers/stationController.js");
		const active = makeMapStation({ isActive: true });
		const inactive = makeMapStation({ id: 2, isActive: false });
		stationServiceMock.findAll.mockResolvedValueOnce([active, inactive]);
		const reply = makeReply();

		await stationController.listPublic({} as any, reply as any);

		const [result] = (reply.send as ReturnType<typeof vi.fn>).mock.calls[0] as [typeof active[]];
		expect(result).toHaveLength(1);
		expect(result[0].isActive).toBe(true);
	});

	it("deve retornar array vazio se não houver estações ativas", async () => {
		const { stationController } = await import("../../src/controllers/stationController.js");
		stationServiceMock.findAll.mockResolvedValueOnce([
			makeMapStation({ isActive: false }),
		]);
		const reply = makeReply();

		await stationController.listPublic({} as any, reply as any);

		const [result] = (reply.send as ReturnType<typeof vi.fn>).mock.calls[0] as [unknown[]];
		expect(result).toHaveLength(0);
	});
});
