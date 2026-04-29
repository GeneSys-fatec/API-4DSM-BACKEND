import type { FastifyReply, FastifyRequest } from "fastify";
import { dashboardService, type DashboardQueryDTO } from "../services/measurementsService.js";

interface MeasurementsQuerystring {
    stationId?: string;
    parameterId?: string;
    startDate?: string;
    endDate?: string;
    period?: "24h" | "7d" | "30d";
    page?: string;
    limit?: string;
}

export class MeasurementsController {
    getMeasurements = async (
        request: FastifyRequest<{ Querystring: MeasurementsQuerystring }>,
        reply: FastifyReply
    ) => {
        try {
            const query = request.query;
            
            
            const filters: DashboardQueryDTO = {
                ...(query.stationId && { stationId: Number(query.stationId) }),
                ...(query.parameterId && { parameterId: Number(query.parameterId) }),
                ...(query.startDate && { startDate: query.startDate }),
                ...(query.endDate && { endDate: query.endDate }),
                ...(query.period && { period: query.period }),
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 100,
            };

            const result = await dashboardService.getMeasurements(filters);
            return reply.send(result);
        } catch (error) {
            console.error("Erro ao buscar medições:", error);
            return reply.status(500).send({ message: "Erro interno ao buscar medições." });
        }
    };

    getAggregations = async (
        request: FastifyRequest<{ Querystring: MeasurementsQuerystring }>,
        reply: FastifyReply
    ) => {
        try {
            const query = request.query;
            
            
            const filters: DashboardQueryDTO = {
                ...(query.stationId && { stationId: Number(query.stationId) }),
                ...(query.parameterId && { parameterId: Number(query.parameterId) }),
                ...(query.startDate && { startDate: query.startDate }),
                ...(query.endDate && { endDate: query.endDate }),
                ...(query.period && { period: query.period }),
            };

            const result = await dashboardService.getAggregations(filters);
            return reply.send(result);
        } catch (error) {
            console.error("Erro ao gerar agregações:", error);
            return reply.status(500).send({ message: "Erro interno ao gerar agregações." });
        }
    };
}

export const measurementsController = new MeasurementsController();