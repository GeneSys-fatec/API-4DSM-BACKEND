import { jwtDecrypt } from "jose";
import { FastifyRequest, FastifyReply } from "fastify";

const secret = new TextEncoder().encode(process.env.JWT_TOKEN as string);

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ error: "Token não fornecido." });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return reply.status(401).send({ error: "Token não fornecido." });
        }

        const { payload } = await jwtDecrypt(token, secret);

        request.user = {
            id: payload.id as number,
            email: payload.email as string,
            iat: payload.iat as number,
            exp: payload.exp as number,
        };

    } catch (error) {
        return reply.status(401).send({ error: "Token inválido ou expirado." });
    }
}