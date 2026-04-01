import type { FastifyReply, FastifyRequest } from "fastify";
import { AdministratorService } from "../services/administratorService.js";

export class AdministratorController {
    async create(request: FastifyRequest, reply: FastifyReply){
        const {name, email, password} = request.body as {name: string, email: string, password: string};

        const administratorService = new AdministratorService();

        try {
            const administrator = await administratorService.create({ name, email, password });

            return reply.send(administrator);

        } catch (error: any) {
            
            return reply.status(400).send({ error: error.message });

        }
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        
        const id = request.body as {id: number}
    
        const administratorService = new AdministratorService();

        try {
            const administrator = await administratorService.delete(id);

            return reply.send(administrator);
        } catch (error: any) {

            return reply.status(400).send({error: error.message})

        }
    }

    async list(request: FastifyRequest, reply: FastifyReply){
        const administratorService = new AdministratorService()

        const administrators = await administratorService.list()

        reply.send(administrators)
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        
        const {id, newEmail, newName, newPassword} = request.body as {id: number, newEmail: string, newName: string, newPassword: string}
    
        const administratorService = new AdministratorService();

        try {
            const administrator = await administratorService.update({id, newEmail, newName, newPassword});

            return reply.send(administrator);
        } catch (error: any) {

            return reply.status(400).send({error: error.message})

        }
    }
};