import { parameterService } from "../services/parameterService.js";
export class ParameterController {
    list = async (_request, reply) => {
        const parameters = await parameterService.findAll();
        return reply.send(parameters);
    };
    findByStation = async (request, reply) => {
        const stationId = Number(request.params.idStation);
        return reply.send(await parameterService.findByStation(stationId));
    };
    findById = async (request, reply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id))
            return reply.status(400).send({ message: "Invalid parameter id" });
        const parameter = await parameterService.findById(id);
        if (!parameter)
            return reply.status(404).send({ message: "Parameter not found" });
        return reply.send(parameter);
    };
    create = async (request, reply) => {
        const { idStation, idTypeParam, isActive } = request.body;
        if (!idStation || !idTypeParam) {
            return reply.status(400).send({ message: "Fields 'idStation' and 'idTypeParam' are required" });
        }
        const parameter = await parameterService.create({
            idStation,
            idTypeParam,
            ...(isActive === undefined ? {} : { isActive }),
        });
        return reply.status(201).send(parameter);
    };
    update = async (request, reply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id))
            return reply.status(400).send({ message: "Invalid parameter id" });
        const parameter = await parameterService.findById(id);
        if (!parameter)
            return reply.status(404).send({ message: "Parameter not found" });
        const { idStation, idTypeParam, isActive } = request.body;
        const updatedParameter = await parameterService.update(id, {
            idStation,
            idTypeParam,
            ...(isActive === undefined ? {} : { isActive }),
        });
        return reply.send(updatedParameter);
    };
    delete = async (request, reply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id))
            return reply.status(400).send({ message: "Invalid parameter id" });
        const parameter = await parameterService.findById(id);
        if (!parameter)
            return reply.status(404).send({ message: "Parameter not found" });
        await parameterService.delete(id);
        return reply.status(204).send({ message: "Parameter deleted successfully" });
    };
}
export const parameterController = new ParameterController();
//# sourceMappingURL=parameterController.js.map