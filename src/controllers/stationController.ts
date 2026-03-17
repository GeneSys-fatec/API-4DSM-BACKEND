import type { FastifyReply, FastifyRequest } from "fastify";
import { stationService } from "../services/stationService.js";

interface StationParams {
	id: string;
}

interface CreateStationBody {
	name: string;
	city: string;
	isActive?: boolean;
}

export class StationController {
	list = async (_request: FastifyRequest, reply: FastifyReply) => {
		const stations = await stationService.findAll();

		return reply.send(stations);
	};

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
		const { name, city, isActive } = request.body;

		if (!name || !city) {
			return reply.status(400).send({
				message: "Fields 'name' and 'city' are required",
			});
		}

		const station = await stationService.create({
			name,
			city,
			...(isActive === undefined ? {} : { isActive }),
		});

		return reply.status(201).send(station);
	};
}

export const stationController = new StationController();
