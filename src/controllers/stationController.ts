import type { FastifyReply, FastifyRequest } from "fastify";
import { stationService } from "../services/stationService.js";
import { parseOptionalBoolean, parseOptionalDate } from "../utils/filterParser.js";

interface StationParams {
	id: string;
}

interface CreateStationBody {
	name: string;
	address: string;
	latitude: string;
	longitude: string;
	idDatalogger: string;
	status: string;
	isActive?: boolean;
}

interface StationListQuery {
	q?: string;
	status?: string;
	isActive?: string;
	user?: string;
	idDatalogger?: string;
	from?: string;
	to?: string;
}

export class StationController {
	list = async (request: FastifyRequest<{ Querystring: StationListQuery }>, reply: FastifyReply) => {
		const query = request.query ?? {};

		const stations = await stationService.findAll({
			q: query.q,
			status: query.status,
			isActive: parseOptionalBoolean(query.isActive),
			user: query.user,
			idDatalogger: query.idDatalogger,
			from: parseOptionalDate(query.from),
			to: parseOptionalDate(query.to, { endOfDay: true }),
		});

		return reply.send(stations);
	};

	findByAddress = async (request: FastifyRequest<{ Params: { address: string } }>,reply: FastifyReply) => {
		const address = request.params.address;
		return reply.send(await stationService.findByAddress(address));
	}

	findById = async (
		request: FastifyRequest<{ Params: StationParams }>,
		reply: FastifyReply,
	) => {
		const id = Number(request.params.id);

		if (Number.isNaN(id)) {
			return reply.status(400).send({ message: "Invalid station id" });
		}

		const station = await stationService.findById(id);

		if (!station) {
			return reply.status(404).send({ message: "Station not found" });
		}

		return reply.send(station);
	};

	create = async (
		request: FastifyRequest<{ Body: CreateStationBody }>,
		reply: FastifyReply,
	) => {
		const { name, address, latitude, longitude, idDatalogger, status, isActive } = request.body;

		if (!name || !address) {
			return reply.status(400).send({
				message: "Fields 'name' and 'address' are required",
			});
		}

		const station = await stationService.create({
			name,
			address,
			latitude,
			longitude,
			idDatalogger,
			status,
			...(isActive === undefined ? {} : { isActive }),
		});

		return reply.status(201).send(station);
	};

	update = async (
		request: FastifyRequest<{ Params: StationParams; Body: CreateStationBody }>,
		reply: FastifyReply,
	) => {		const id = Number(request.params.id);

		if (Number.isNaN(id)) {
			return reply.status(400).send({ message: "Invalid station id" });
		}

		const station = await stationService.findById(id);

		if (!station) {
			return reply.status(404).send({ message: "Station not found" });
		}

		const { name, address, latitude, longitude, idDatalogger, status, isActive } = request.body;

		const updatedStation = await stationService.update(id, {
			name,
			address,
			latitude,
			longitude,
			idDatalogger,
			status,
			...(isActive === undefined ? {} : { isActive }),
		});

		return reply.send(updatedStation);
	};

	delete = async (
		request: FastifyRequest<{ Params: StationParams }>,
		reply: FastifyReply,
	) => {
		const id = Number(request.params.id);

		if (Number.isNaN(id)) {
			return reply.status(400).send({ message: "Invalid station id" });
		}

		const station = await stationService.findById(id);

		if (!station) {
			return reply.status(404).send({ message: "Station not found" });
		}

		await stationService.delete(id);

		return reply.status(204).send({message: "Station deleted successfully" });
	};

	listPublic = async (_request: FastifyRequest, reply: FastifyReply) => {
		const stations = await stationService.findAll();
		
		const activeStations = stations.filter(station => station.isActive);
		
		return reply.send(activeStations);
	};

}

export const stationController = new StationController();
