import { stationService } from "../services/stationService.js";
export class StationController {
    list = async (_request, reply) => {
        const stations = await stationService.findAll();
        return reply.send(stations);
    };
    findByAddress = async (request, reply) => {
        const address = request.params.address;
        return reply.send(await stationService.findByAddress(address));
    };
    findById = async (request, reply) => {
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
    create = async (request, reply) => {
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
    update = async (request, reply) => {
        const id = Number(request.params.id);
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
    delete = async (request, reply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "Invalid station id" });
        }
        const station = await stationService.findById(id);
        if (!station) {
            return reply.status(404).send({ message: "Station not found" });
        }
        await stationService.delete(id);
        return reply.status(204).send({ message: "Station deleted successfully" });
    };
}
export const stationController = new StationController();
//# sourceMappingURL=stationController.js.map