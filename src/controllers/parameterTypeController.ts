import type { FastifyReply, FastifyRequest } from "fastify";
import { parameterTypeService } from "../services/parameterTypeService.js";

interface ParameterTypeParams {
    id: string;
}

interface CreateParameterTypeBody {
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description?: string;
}

export class ParameterTypeController {
    list = async (_request: FastifyRequest, reply: FastifyReply) => {
        const parameterTypes = await parameterTypeService.findAll();

        return reply.send(parameterTypes);
    };

    findById = async (
        request: FastifyRequest<{ Params: ParameterTypeParams }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "ID inválido!" });
        }

        const parameterType = await parameterTypeService.findById(id);

        if (!parameterType) {
            return reply.status(404).send({ message: "Parâmetro não encontrado." });
        }

        return reply.send(parameterType);
    };

    create = async (
        request: FastifyRequest<{ Body: CreateParameterTypeBody }>,
        reply: FastifyReply,
    ) => {
        const { name, unit, factor, offset, description } = request.body;

        if (!name || !unit || factor === undefined || offset === undefined) {
            return reply.status(400).send({
                message: "Os campos 'name', 'unit', 'factor' e 'offset' são obrigatórios.",
            });
        }

        const parameterType = await parameterTypeService.create({
            name,
            unit,
            factor,
            offset,
            description: description ?? "",
        });

        return reply.status(201).send(parameterType);
    };

    update = async (
        request: FastifyRequest<{ Params: ParameterTypeParams; Body: Partial<CreateParameterTypeBody> }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "ID inválido!" });
        }

        const parameterType = await parameterTypeService.findById(id);

        if (!parameterType) {
            return reply.status(404).send({ message: "Parâmetro não encontrado." });
        }

        const { name, unit, factor, offset, description } = request.body;

        const dataToUpdate = {
            ...(name === undefined ? {} : { name }),
            ...(unit === undefined ? {} : { unit }),
            ...(factor === undefined ? {} : { factor }),
            ...(offset === undefined ? {} : { offset }),
            ...(description === undefined ? {} : { description }),
        };

        if (Object.keys(dataToUpdate).length === 0) {
            return reply.status(400).send({ message: "Informe ao menos um campo para atualização." });
        }

        const updatedParameterType = await parameterTypeService.update(id, {
            ...dataToUpdate,
        });

        return reply.send(updatedParameterType);
    };

    delete = async (
        request: FastifyRequest<{ Params: ParameterTypeParams }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "ID inválido!" });
        }

        const parameterType = await parameterTypeService.findById(id);

        if (!parameterType) {
            return reply.status(404).send({ message: "Parâmetro não encontrado." });
        }

        await parameterTypeService.delete(id);

        return reply.status(204).send({ message: "Parâmetro excluído com sucesso!" });
    };
}

export const parameterTypeController = new ParameterTypeController();
