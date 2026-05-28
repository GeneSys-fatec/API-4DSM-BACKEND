import type { FastifyReply, FastifyRequest } from "fastify";
import { alertService, alertNotificationEmitter, type AlertListFilters, type EvaluateMeasurementInput } from "../services/alertService.js";

interface AlertPayload {
    idParameter?: { id: number };
    triggeredAt?: Date;
    texto?: string;
    titulo?: string;
    isRead?: boolean;
    stationName?: string;
    [key: string]: unknown;
}

function mapAlertResponse(alert: AlertPayload) {
    return {
        ...alert,
        parameterId: alert.idParameter?.id,
        occurredAt: alert.triggeredAt,
        description: alert.texto ?? alert.titulo ?? "",
        isRead: alert.isRead,
    };
}

export class AlertController {
    list = async (request: FastifyRequest<{ Querystring: Record<string, string | undefined> }>, reply: FastifyReply) => {
        const query = request.query || {};
        
        const filters: AlertListFilters = {};
        if (query.stationId !== undefined) filters.stationId = Number(query.stationId);
        if (query.parameterId !== undefined) filters.parameterId = Number(query.parameterId);
        if (query.idTypeParam !== undefined) filters.idTypeParam = Number(query.idTypeParam);
        if (query.status !== undefined) filters.status = query.status as AlertListFilters["status"];
        if (query.user !== undefined) filters.user = query.user;
        if (query.q !== undefined) filters.q = query.q;
        if (query.from !== undefined) filters.from = new Date(query.from);
        if (query.to !== undefined) filters.to = new Date(query.to);
        if (query.isRead !== undefined) filters.isRead = query.isRead === 'true' || query.isRead === true;
        if (query.page !== undefined) filters.page = Number(query.page);
        if (query.limit !== undefined) filters.limit = Number(query.limit);

        const paginatedResult = await alertService.listAlerts(filters);
        
        return reply.send({
            ...paginatedResult,
            data: paginatedResult.data.map((item) => mapAlertResponse(item as unknown as AlertPayload))
        });
    };

    delete = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const params = request.params;
        const id = Number(params.id);
        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "Invalid alert id" });
        }

        const deleted = await alertService.deleteAlert(id);
        if (!deleted) {
            return reply.status(404).send({ message: "Alert not found" });
        }

        return reply.status(204).send();
    };

    markAsRead = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const params = request.params;
        const id = Number(params.id);
        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "Invalid alert id" });
        }

        const success = await alertService.markAsRead(id);
        if (!success) {
            return reply.status(404).send({ message: "Alert not found" });
        }

        return reply.status(204).send();
    };

    markAllAsRead = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const count = await alertService.markAllAsRead();
            return reply.send({ message: `${count} alertas marcados como lidos` });
        } catch (error) {
            return reply.status(500).send({ message: error instanceof Error ? error.message : "Erro interno" });
        }
    };

    clearRead = async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const count = await alertService.clearReadAlerts();
            return reply.send({ message: `${count} alertas lidos foram apagados` });
        } catch (error) {
            return reply.status(500).send({ message: error instanceof Error ? error.message : "Erro interno" });
        }
    };

    stream = async (request: FastifyRequest, reply: FastifyReply) => {
        reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        });

        try {
            const paginatedResult = await alertService.listAlerts({ isRead: false, status: "active" as AlertListFilters["status"] });
            const unreadAlerts = paginatedResult.data;
            if (unreadAlerts.length > 0) {
                reply.raw.write(`data: ${JSON.stringify(unreadAlerts.map((item) => mapAlertResponse(item as unknown as AlertPayload)))}\n\n`);
            }
        } catch (_error) {
            // Erro ao carregar alertas ignorado para manter stream ativo
        }

        const onAlert = (alert: AlertPayload) => {
            if (alert && alert.stationName) {
                reply.raw.write(`data: ${JSON.stringify(alert)}\n\n`);
            } else {
                const data = JSON.stringify(mapAlertResponse(alert));
                reply.raw.write(`data: ${data}\n\n`);
            }
        };

        alertNotificationEmitter.on("alertTriggered", onAlert);

        request.raw.on("close", () => {
            alertNotificationEmitter.off("alertTriggered", onAlert);
        });

        reply.hijack();
    };

    evaluate = async (request: FastifyRequest<{ Body: EvaluateMeasurementInput }>, reply: FastifyReply) => {
        const { parameterId, measuredValue, occurredAt } = request.body || {};

        if (!parameterId || measuredValue === undefined || !occurredAt) {
            return reply.status(400).send({
                message: "Fields 'parameterId', 'measuredValue' and 'occurredAt' are required",
            });
        }

        try {
            const generated = await alertService.evaluateMeasurement({ parameterId, measuredValue, occurredAt });
            
            return reply.send({
                generatedCount: generated.length,
                alerts: generated.map((item) => mapAlertResponse(item as unknown as AlertPayload)),
            });
        } catch (error) {
            return reply.status(400).send({ message: error instanceof Error ? error.message : "Unknown error" });
        }
    };
}

export const alertController = new AlertController();