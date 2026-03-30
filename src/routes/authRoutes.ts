import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { AuthController } from '../controllers/authController.js';

const authBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

const authController = new AuthController();

export async function authRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.post('/login', {
        schema: {
            tags: ['autenticação'],
            summary: 'Login de administrador',
            body: authBodySchema,
        },
        handler: authController.login.bind(authController),
    })
}