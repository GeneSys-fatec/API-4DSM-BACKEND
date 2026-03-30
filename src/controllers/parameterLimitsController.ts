import type { FastifyReply, FastifyRequest } from "fastify";
import { parameterLimitsService } from "../services/parameterLimitsService.js";

interface ParameterLimitsParams {
    id: string;
}

interface CreateParameterLimitsBody {
    idTypeParam: number;
    minExpected: number;
    maxExpected: number;
}

export class ParameterLimitsController {
    list = async (_request: FastifyRequest, reply: FastifyReply) => {
        const parameterLimits = await parameterLimitsService.findAll();

        return reply.send(parameterLimits);
    };

    findByTypeParam = async (
        request: FastifyRequest<{ Params: { idTypeParam: number } }>,
        reply: FastifyReply,
    ) => {
        const idTypeParam = request.params.idTypeParam;
        return reply.send(await parameterLimitsService.findByTypeParam(idTypeParam));
    };

    findById = async (
        request: FastifyRequest<{ Params: ParameterLimitsParams }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "ID inválido!" });
        }

        const parameterLimits = await parameterLimitsService.findById(id);

        if (!parameterLimits) {
            return reply.status(404).send({ message: "Limite de parâmetro não encontrado." });
        }

        return reply.send(parameterLimits);
    };

    create = async (
        request: FastifyRequest<{ Body: CreateParameterLimitsBody }>,
        reply: FastifyReply,
    ) => {
        const { idTypeParam, minExpected, maxExpected } = request.body;

        if (!idTypeParam || minExpected === undefined || maxExpected === undefined) {
            return reply.status(400).send({
                message: "Os campos 'idTypeParam', 'minExpected' e 'maxExpected' são obrigatórios.",
            });
        }

        const parameterLimits = await parameterLimitsService.create({
            idTypeParam,
            minExpected,
            maxExpected,
        });

        return reply.status(201).send(parameterLimits);
    };

    update = async (
        request: FastifyRequest<{ Params: ParameterLimitsParams; Body: Partial<CreateParameterLimitsBody> }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "ID inválido!" });
        }

        const parameterLimits = await parameterLimitsService.findById(id);

        if (!parameterLimits) {
            return reply.status(404).send({ message: "Limite de parâmetro não encontrado." });
        }

        const { idTypeParam, minExpected, maxExpected } = request.body;

        const dataToUpdate = {
            ...(idTypeParam === undefined ? {} : { idTypeParam }),
            ...(minExpected === undefined ? {} : { minExpected }),
            ...(maxExpected === undefined ? {} : { maxExpected }),
        };

        if (Object.keys(dataToUpdate).length === 0) {
            return reply.status(400).send({ message: "Informe ao menos um campo para atualização." });
        }

        const updatedParameterLimits = await parameterLimitsService.update(id, dataToUpdate);

        return reply.send(updatedParameterLimits);
    };

    delete = async (
        request: FastifyRequest<{ Params: ParameterLimitsParams }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);

        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "ID inválido!" });
        }

        const parameterLimits = await parameterLimitsService.findById(id);

        if (!parameterLimits) {
            return reply.status(404).send({ message: "Limite de parâmetro não encontrado." });
        }

        await parameterLimitsService.delete(id);

        return reply.status(204).send({ message: "Limite de parâmetro excluído com sucesso!" });
    };
}

export const parameterLimitsController = new ParameterLimitsController();
