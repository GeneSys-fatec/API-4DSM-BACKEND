import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { stationController } from '../controllers/stationController.js'

export async function stationRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  fastify.get('/', stationController.list)
  fastify.get('/address/:address', stationController.findByAddress)
  fastify.get('/:id', stationController.findById)
  fastify.post('/', stationController.create)
}