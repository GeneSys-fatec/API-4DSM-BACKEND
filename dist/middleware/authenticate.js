import { jwtDecrypt } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_TOKEN);
export async function authenticate(request, reply) {
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
            id: payload.id,
            email: payload.email,
            iat: payload.iat,
            exp: payload.exp,
        };
    }
    catch (error) {
        return reply.status(401).send({ error: "Token inválido ou expirado." });
    }
}
//# sourceMappingURL=authenticate.js.map