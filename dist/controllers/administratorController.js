import { AdministratorService } from "../services/administratorService.js";
export class AdministratorController {
    async create(request, reply) {
        const { name, email, password } = request.body;
        const administratorService = new AdministratorService();
        try {
            const administrator = await administratorService.create({ name, email, password });
            return reply.send(administrator);
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    }
    async delete(request, reply) {
        const id = request.body;
        const administratorService = new AdministratorService();
        try {
            const administrator = await administratorService.delete(id);
            return reply.send(administrator);
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    }
    async list(request, reply) {
        const administratorService = new AdministratorService();
        const administrators = await administratorService.list();
        reply.send(administrators);
    }
    async update(request, reply) {
        const { id, newEmail, newName, newPassword } = request.body;
        const administratorService = new AdministratorService();
        try {
            const administrator = await administratorService.update({ id, newEmail, newName, newPassword });
            return reply.send(administrator);
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    }
}
;
//# sourceMappingURL=administratorController.js.map