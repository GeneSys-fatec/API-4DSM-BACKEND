import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { AdministratorController } from '../controllers/administratorController.js'

const administratorIdSchema = z.object({
    id: z.number().int().describe('Administrator id'),
})

const administratorBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
})

const administratorUpdateSchema = z.object({
    id: z.number().int(),
    newName: z.string().optional(),
    newEmail: z.string().email().optional(),
    newPassword: z.string().min(6).optional(),
})

const administratorController = new AdministratorController();

export async function administratorRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get('/', {
        schema: {
            tags: ['administradores'],
            summary: 'Listagem de administradores',
        },
        handler: administratorController.list.bind(administratorController),
    })

    fastify.post('/create', {
        schema: {
            tags: ['administradores'],
            summary: 'Crie um novo administrador',
            body: administratorBodySchema,
        },
        handler: administratorController.create.bind(administratorController),
    })

    fastify.put('/update', {
        schema: {
            tags: ['administradores'],
            summary: 'Atualize um administrador',
            body: administratorUpdateSchema,
        },
        handler: administratorController.update.bind(administratorController),
    })

    fastify.delete('/delete', {
        schema: {
            tags: ['administradores'],
            summary: 'Delete um administrador',
            body: administratorIdSchema,
        },
        handler: administratorController.delete.bind(administratorController),
    })
}