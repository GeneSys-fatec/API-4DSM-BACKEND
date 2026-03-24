import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { stationController } from '../controllers/stationController.js'
import { z } from 'zod'

const stationIdSchema = z.object({
  id: z.string().describe('Station id'),
})

const stationBodySchema = z.object({
  name: z.string(),
  address: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  idDatalogger: z.string(),
  status: z.string(),
  isActive: z.boolean().optional(),
})

export async function stationRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  fastify.get('/', {
    schema: {
      tags: ['estações'],
      summary: 'Listagem de estações',
    },
    handler: stationController.list,
  })

  fastify.get('/address/:address', {
    schema: {
      tags: ['estações'],
      summary: 'Localize estações pelo endereço',
      params: z.object({
        address: z.string().describe('Endereço da estação'),
      }),
    },
    handler: stationController.findByAddress,
  })

  fastify.get('/:id', {
    schema: {
      tags: ['estações'],
      summary: 'Localize estações pelo id',
      params: stationIdSchema,
    },
    handler: stationController.findById,
  })

  fastify.post('/create', {
    schema: {
      tags: ['estações'],
      summary: 'Crie uma nova estação',
      body: stationBodySchema,
    },
    handler: stationController.create,
  })

  fastify.put('/update/:id', {
    schema: {
      tags: ['estações'],
      summary: 'Atualize uma estação pelo id',
      params: stationIdSchema,
      body: stationBodySchema,
    },
    handler: stationController.update,
  })

  fastify.patch('/:id', {
    schema: {
      tags: ['estações'],
      summary: 'Atualize uma estação pelo id',
      params: stationIdSchema,
      body: stationBodySchema,
    },
    handler: stationController.update,
  })

  fastify.delete('/delete/:id', {
    schema: {
      tags: ['estações'],
      summary: 'Delete uma estação pelo id',
      params: stationIdSchema,
    },
    handler: stationController.delete,
  })
}