import type { FastifyReply, FastifyRequest } from "fastify";
import { parameterService } from "../services/parameterService.js";

interface ParameterParams {
    id: string;
}

interface CreateParameterBody {
    idStation: number;
    idTypeParam: number;
    isActive?: boolean;
}

export class ParameterController {
    list = async (_request: FastifyRequest, reply: FastifyReply) => {
        const parameters = await parameterService.findAll();
        return reply.send(parameters);
    };

    findByStation = async (request: FastifyRequest<{ Params: { idStation: number } }>, reply: FastifyReply) => {
        const stationId = Number(request.params.idStation);
        return reply.send(await parameterService.findByStation(stationId));
    }

    findById = async (request: FastifyRequest<{ Params: ParameterParams }>, reply: FastifyReply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id)) return reply.status(400).send({ message: "Invalid parameter id" });
        const parameter = await parameterService.findById(id);
        if (!parameter) return reply.status(404).send({ message: "Parameter not found" });
        return reply.send(parameter);
    };

    create = async (request: FastifyRequest<{ Body: CreateParameterBody }>, reply: FastifyReply) => {
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

    update = async (request: FastifyRequest<{ Params: ParameterParams; Body: CreateParameterBody }>, reply: FastifyReply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id)) return reply.status(400).send({ message: "Invalid parameter id" });
        
        const parameter = await parameterService.findById(id);
        if (!parameter) return reply.status(404).send({ message: "Parameter not found" });

        const { idStation, idTypeParam, isActive } = request.body;

        const updatedParameter = await parameterService.update(id, {
            idStation,
            idTypeParam,
            ...(isActive === undefined ? {} : { isActive }),
        });

        return reply.send(updatedParameter);
    };

    delete = async (request: FastifyRequest<{ Params: ParameterParams }>, reply: FastifyReply) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id)) return reply.status(400).send({ message: "Invalid parameter id" });
        
        const parameter = await parameterService.findById(id);
        if (!parameter) return reply.status(404).send({ message: "Parameter not found" });

        await parameterService.delete(id);
        return reply.status(204).send({ message: "Parameter deleted successfully" });
    };
}

export const parameterController = new ParameterController();