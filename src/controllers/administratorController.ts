import type { FastifyReply, FastifyRequest } from "fastify";
import { AdministratorService } from "../services/administratorService.js";
import { parseOptionalBoolean, parseOptionalDate } from "../utils/filterParser.js";
import bcrypt from "bcrypt";

interface AdministratorListQuery {
    q?: string;
    status?: string;
    from?: string;
    to?: string;
}

export class AdministratorController {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const { name, email, password } = request.body as { name: string, email: string, password: string };
        const administratorService = new AdministratorService();
        try {
            const administrator = await administratorService.create({ name, email, password });
            return reply.send(administrator);
        } catch (error) {
            return reply.status(400).send({ error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async list(request: FastifyRequest<{ Querystring: AdministratorListQuery }>, reply: FastifyReply) {
        const query = request.query ?? {};
        const status = parseOptionalBoolean(query.status);
        const from = parseOptionalDate(query.from);
        const to = parseOptionalDate(query.to, { endOfDay: true });

        const administratorService = new AdministratorService()
        const administrators = await administratorService.list({
            ...(query.q !== undefined ? { q: query.q } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(from !== undefined ? { from } : {}),
            ...(to !== undefined ? { to } : {}),
        })
        reply.send(administrators)
    }

    async getMe(request: FastifyRequest, reply: FastifyReply) {
        const id = request.user?.id;
        if (!id) {
            return reply.status(401).send({ error: "Não autenticado." });
        }
        const administratorService = new AdministratorService();
        try {
            const administrator = await administratorService.listById(id);
            return reply.send(administrator);
        } catch (error) {
            return reply.status(404).send({ error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async listById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: number };
        const administratorService = new AdministratorService();

        try {
            const administrator = await administratorService.listById(id);
            return reply.send(administrator);
        } catch (error) {
            return reply.status(404).send({ error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: number };
        const { newEmail, newName, newPassword, currentPassword } = request.body as { newEmail?: string, newName?: string, newPassword?: string, currentPassword?: string };

        const administratorService = new AdministratorService();

        try {
            if (id !== request.user?.id) {
                return reply.status(403).send({ error: "Você só pode alterar o seu próprio perfil." });
            }

            if (newPassword) {
                if (!currentPassword) {
                    return reply.status(400).send({ error: "A senha atual é obrigatória para alteração de senha." });
                }
                const admin = await administratorService.listById(id);
                const isCorrect = await bcrypt.compare(currentPassword, admin.password);
                if (!isCorrect) {
                    return reply.status(400).send({ error: "Senha atual incorreta." });
                }
            }

            const administrator = await administratorService.update({ id, newEmail, newName, newPassword });
            return reply.send(administrator);
        } catch (error) {
            return reply.status(400).send({ error: error instanceof Error ? error.message : "Unknown error" });
        }
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: number };
        const administratorService = new AdministratorService();

        try {
            const result = await administratorService.delete({ id });
            return reply.send(result);
        } catch (error) {
            return reply.status(400).send({ error: error instanceof Error ? error.message : "Unknown error" });
        }
    }
}