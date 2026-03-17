import type { FastifyReply, FastifyRequest } from "fastify";
import { parameterService } from "../services/parameterService.js";

interface ParameterParams {
    id: string;
}

interface CreateParameterBody {
    name: string;
    city: string;
    isActive?: boolean;
}

export class ParameterController {
    list = async (_request: FastifyRequest, reply: FastifyReply) => {
        const parameters = await parameterService.findAll();

        return reply.send(parameters);
    };

    findById = async (
        request: FastifyRequest<{ Params: ParameterParams }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "Invalid parameter id" });
        }

        const parameter = await parameterService.findById(id);

        if (!parameter) {
            return reply.status(404).send({ message: "Parameter not found" });
        }

        return reply.send(parameter);
    };

    create = async (
        request: FastifyRequest<{ Body: CreateParameterBody }>,
        reply: FastifyReply,
    ) => {
        const { name, city, isActive } = request.body;

        if (!name || !city) {
            return reply.status(400).send({
                message: "Fields 'name' and 'city' are required",
            });
        }

        const parameter = await parameterService.create({
            name,
            city,
            ...(isActive === undefined ? {} : { isActive }),
        });

        return reply.status(201).send(parameter);
    };
}

export const parameterController = new ParameterController();
