import { AuthService } from "../services/authService.js";
export class AuthController {
    async login(request, reply) {
        const { email, password } = request.body;
        const authService = new AuthService();
        try {
            const auth = await authService.login({ email, password });
            return auth;
        }
        catch (error) {
            return reply.status(400).send({ error: error.message });
        }
    }
}
//# sourceMappingURL=authController.js.map