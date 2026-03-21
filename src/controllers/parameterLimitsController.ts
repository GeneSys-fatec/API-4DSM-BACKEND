import type { FastifyReply, FastifyRequest } from "fastify";
import { ParameterLimitsService } from "../services/parameterLimitsService.js";

const service = new ParameterLimitsService();

export class ParameterLimitsController {
  async create(req: FastifyRequest, reply: FastifyReply) {
    try {
      const newLimit = await service.create(req.body as any);
      return reply.status(201).send(newLimit);
    } catch (error) {
      return reply.status(500).send({ error: "Erro ao criar o limite de parâmetros" });
    }
  }

    async findAll(req: FastifyRequest, reply: FastifyReply) {
        try {
            const limits = await service.findAll();
            return reply.status(200).send(limits);
        } catch (error) {
            return reply.status(500).send({error: "Erro ao obter linmites dos parâmetros" });
        }
    }

    async findById(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
        try{
            const id = parseInt(req.params.id);
            const limit = await service.findById(id);
            if (!limit) return reply.status(404).send({ error: "Limite de parâmetro não encontrado" });
            return reply.status(200).send(limit);
        } catch(error){
            return reply.status(500).send({ error:"Erro ao buscar os limites de parâmetros" })
        }
    }

    async update(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
        try {
            const id = parseInt(req.params.id);
            const updatedLimit = await service.update(id, req.body as any);
            if (!updatedLimit) return reply.status(404).send({error: "Limite de parâmetros não encontrado"});
            return reply.status(200).send(updatedLimit);
        } catch (error) {
            return reply.status(500).send({ error: "Erro ao atualizar o limite de parâmetros"})
        }
    }

    async delete(req: FastifyRequest<{Params: {id: string}}>, reply: FastifyReply) {
        try {
            const id = parseInt(req.params.id);
            const deleted = await service.delete(id);
            if (!deleted) return reply.status(404).send({ error: "Lista de parâmetro não encontrada"});
            return reply.status(204).send();
        } catch (error){
            return reply.status(500).send({error: "Erro ao deletar lista de parâmetros"});
        }
    }
}