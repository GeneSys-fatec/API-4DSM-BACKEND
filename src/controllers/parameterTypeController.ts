import type { FastifyReply, FastifyRequest } from "fastify";
import { parameterTypeService } from "../services/parameterTypeService.js";
import { parseOptionalDate } from "../utils/filterParser.js";

interface ParameterTypeParams {
    id: string;
}

interface CreateParameterTypeBody {
    json_key: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description?: string;
}

interface ParameterTypeListQuery {
    q?: string;
    from?: string;
    to?: string;
}

export class ParameterTypeController {
    list = async (request: FastifyRequest<{ Querystring: ParameterTypeListQuery }>, reply: FastifyReply) => {
        const query = request.query ?? {};

        const parameterTypes = await parameterTypeService.findAll({
            q: query.q,
            from: parseOptionalDate(query.from),
            to: parseOptionalDate(query.to, { endOfDay: true }),
        });

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

    create = async (request: FastifyRequest<{ Body: CreateParameterTypeBody }>, reply: FastifyReply) => {
        const { json_key, name, unit, factor, offset, description } = request.body; 

        if (!json_key || !name || !unit || factor === undefined || offset === undefined) { 
            return reply.status(400).send({
                message: "Os campos 'json_key', 'name', 'unit', 'factor' e 'offset' são obrigatórios.",
            });
        }

        const parameterType = await parameterTypeService.create({
            json_key,
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

        
        const { json_key, name, unit, factor, offset, description } = request.body;

        const dataToUpdate = {
            ...(json_key === undefined ? {} : { json_key }), 
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