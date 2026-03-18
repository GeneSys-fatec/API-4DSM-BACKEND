import type { FastifyReply, FastifyRequest } from "fastify";
import { stationService } from "../services/stationService.js";

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

export class StationController {
	list = async (_request: FastifyRequest, reply: FastifyReply) => {
		const stations = await stationService.findAll();

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
}

export const stationController = new StationController();
