import type { FastifyReply, FastifyRequest } from "fastify";

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { role?: string } | undefined;
    
    if (!user || user.role !== "admin") {
        return reply.status(403).send({ message: "Acesso restrito. Apenas administradores têm permissão para acessar este recurso." });
    }
}