import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/authService.js";

export class AuthController {
    async login(request: FastifyRequest, reply: FastifyReply){
        const {email, password} = request.body as {email: string, password: string};

        const authService = new AuthService();

        try{
            const auth = await authService.login({email, password});

            return auth
        }   catch (error: any) {
            
            return reply.status(400).send({ error: error.message });

        }
    }
    async logout(request: FastifyRequest, reply: FastifyReply) {
        return reply.status(200).send({ message: "Logout realizado com sucesso." });
    }
}