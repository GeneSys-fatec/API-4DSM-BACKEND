import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { z } from 'zod'
import { AdministratorController } from '../controllers/administratorController.js'

const paramsSchema = z.object({
    id: z.coerce.number().int().describe('Administrator id'),
})

const administratorBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
})

const administratorUpdateSchema = z.object({
    newName: z.string().optional(),
    newEmail: z.string().email().optional(),
    newPassword: z.string().min(6).optional(),
})

const administratorListQuerySchema = z.object({
    q: z.string().optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
})

const administratorController = new AdministratorController();

export async function administratorRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get('/', {
        schema: {
            tags: ['administradores'],
            summary: 'Listagem de administradores',
            querystring: administratorListQuerySchema,
        },
        handler: administratorController.list.bind(administratorController),
    })

    fastify.get('/:id', {
        schema: {
            tags: ['administradores'],
            summary: 'Busca um administrador específico pelo ID',
            params: paramsSchema,
        },
        handler: administratorController.listById.bind(administratorController),
    })

    fastify.post('/create', {
        schema: { tags: ['administradores'], summary: 'Crie um novo administrador', body: administratorBodySchema },
        handler: administratorController.create.bind(administratorController),
    })

    fastify.put('/update/:id', {
        schema: { tags: ['administradores'], summary: 'Atualize um administrador', params: paramsSchema, body: administratorUpdateSchema },
        handler: administratorController.update.bind(administratorController),
    })

    fastify.delete('/delete/:id', {
        schema: {
            tags: ['administradores'],
            summary: 'Delete um administrador',
            params: paramsSchema
        },
        handler: administratorController.delete.bind(administratorController),
    });
}