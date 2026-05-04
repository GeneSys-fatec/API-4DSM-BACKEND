import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { parameterController } from '../controllers/parameterController.js'
import { z } from 'zod'

const parameterIdSchema = z.object({
    id: z.string().describe('Parameter id'),
})

const parameterBodySchema = z.object({
    idStation: z.number().int(),
    idTypeParam: z.number().int(),
    isActive: z.boolean().optional(),
})

const parameterListQuerySchema = z.object({
    q: z.string().optional(),
    idStation: z.string().optional(),
    idTypeParam: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
})

const stationParameterQuerySchema = z.object({
    q: z.string().optional(),
    idTypeParam: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
})

export async function parameterRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get('/', {
        schema: {
            tags: ['parâmetros'],
            summary: 'Listagem de parâmetros',
            querystring: parameterListQuerySchema,
        },
        handler: parameterController.list,
    })

    fastify.get('/station/:idStation', {
        schema: {
            tags: ['parâmetros'],
            summary: 'Localize parâmetros pela estação',
            params: z.object({
                idStation: z.string().describe('ID da estação'),
            }),
            querystring: stationParameterQuerySchema,
        },
        handler: parameterController.findByStation,
    })

    fastify.get('/:id', {
        schema: {
            tags: ['parâmetros'],
            summary: 'Localize parâmetros pelo id',
            params: parameterIdSchema,
        },
        handler: parameterController.findById,
    })

    fastify.post('/create', {
        schema: {
            tags: ['parâmetros'],
            summary: 'Crie um novo parâmetro',
            body: parameterBodySchema,
        },
        handler: parameterController.create,
    })

    fastify.put('/update/:id', {
        schema: {
            tags: ['parâmetros'],
            summary: 'Atualize um parâmetro pelo id',
            params: parameterIdSchema,
            body: parameterBodySchema,
        },
        handler: parameterController.update,
    })

    fastify.delete('/delete/:id', {
        schema: {
            tags: ['parâmetros'],
            summary: 'Delete um parâmetro pelo id',
            params: parameterIdSchema,
        },
        handler: parameterController.delete,
    })

}