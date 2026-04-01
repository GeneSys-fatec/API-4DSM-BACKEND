import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { parameterLimitsController } from '../controllers/parameterLimitsController.js'
import { z } from 'zod'

const parameterLimitsIdSchema = z.object({
    id: z.string().describe('ID do limite de parâmetro'),
})

const parameterLimitsBodySchema = z.object({
    idTypeParam: z.number().int(),
    minExpected: z.number().int(),
    maxExpected: z.number().int(),
})

export async function parameterLimitsRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get('/', {
        schema: {
            tags: ['limites de parâmetros'],
            summary: 'Listagem de limites de parâmetros',
        },
        handler: parameterLimitsController.list,
    })

    fastify.get('/parameter/:idTypeParam', {
        schema: {
            tags: ['limites de parâmetros'],
            summary: 'Localize limites pelo parâmetro',
            params: z.object({
                idTypeParam: z.string().describe('ID do parâmetro'),
            }),
        },
        handler: parameterLimitsController.findByTypeParam,
    })

    fastify.get('/:id', {
        schema: {
            tags: ['limites de parâmetros'],
            summary: 'Localize limites de parâmetros pelo id',
            params: parameterLimitsIdSchema,
        },
        handler: parameterLimitsController.findById,
    })

    fastify.post('/create', {
        schema: {
            tags: ['limites de parâmetros'],
            summary: 'Crie um novo limite de parâmetro',
            body: parameterLimitsBodySchema,
        },
        handler: parameterLimitsController.create,
    })

    fastify.put('/update/:id', {
        schema: {
            tags: ['limites de parâmetros'],
            summary: 'Atualize um limite de parâmetro pelo id',
            params: parameterLimitsIdSchema,
            body: parameterLimitsBodySchema,
        },
        handler: parameterLimitsController.update,
    })

    fastify.delete('/delete/:id', {
        schema: {
            tags: ['limites de parâmetros'],
            summary: 'Delete um limite de parâmetro pelo id',
            params: parameterLimitsIdSchema,
        },
        handler: parameterLimitsController.delete,
    })

}