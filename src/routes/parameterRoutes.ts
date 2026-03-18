import type { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { parameterController } from '../controllers/parameterController.js'

export async function parameterRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
    fastify.get('/', parameterController.list)
    fastify.get('/:id', parameterController.findById)
    fastify.post('/', parameterController.create)
    // fastify.put('/:id', parameterController.update)
    // fastify.delete('/:id', parameterController.delete)

}