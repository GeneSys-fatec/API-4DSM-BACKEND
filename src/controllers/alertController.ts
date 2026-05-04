import type { FastifyReply, FastifyRequest } from "fastify";
import type { AlertLogEntity } from "../entities/alertLogEntity.js";
import { alertService } from "../services/alertService.js";
import { parseOptionalDate, parseOptionalNumber } from "../utils/filterParser.js";

interface AlertParams {
    id: string;
}

interface CreateAlertBody {
    parameterId: number;
    measuredValue: number;
    occurredAt: string;
    description: string;
}

interface EvaluateBody {
    parameterId: number;
    measuredValue: number;
    occurredAt: string;
}

interface AlertListQuery {
    q?: string;
    stationId?: string;
    parameterId?: string;
    idTypeParam?: string;
    status?: "active" | "resolved";
    user?: string;
    from?: string;
    to?: string;
}

function mapAlertResponse(alert: AlertLogEntity) {
    return {
        id: alert.id,
        parameterId: alert.idParameter.id,
        measurementId: alert.idMeasurement.id,
        measuredValue: Number(alert.triggeredValue),
        occurredAt: alert.triggeredAt,
        description: alert.texto ?? alert.titulo ?? "",
        status: alert.status,
    };
}

export class AlertController {
    list = async (request: FastifyRequest<{ Querystring: AlertListQuery }>, reply: FastifyReply) => {
        const query = request.query ?? {};
        const stationId = parseOptionalNumber(query.stationId);
        const parameterId = parseOptionalNumber(query.parameterId);
        const idTypeParam = parseOptionalNumber(query.idTypeParam);
        const from = parseOptionalDate(query.from);
        const to = parseOptionalDate(query.to, { endOfDay: true });

        const alerts = await alertService.listAlerts({
            ...(query.q !== undefined ? { q: query.q } : {}),
            ...(stationId !== undefined ? { stationId } : {}),
            ...(parameterId !== undefined ? { parameterId } : {}),
            ...(idTypeParam !== undefined ? { idTypeParam } : {}),
            ...(query.status !== undefined ? { status: query.status } : {}),
            ...(query.user !== undefined ? { user: query.user } : {}),
            ...(from !== undefined ? { from } : {}),
            ...(to !== undefined ? { to } : {}),
        });
        return reply.send(alerts.map(mapAlertResponse));
    };

    create = async (
        request: FastifyRequest<{ Body: CreateAlertBody }>,
        reply: FastifyReply,
    ) => {
        const { parameterId, measuredValue, occurredAt, description } = request.body;

        if (!parameterId || measuredValue === undefined || !occurredAt || !description) {
            return reply.status(400).send({
                message: "Fields 'parameterId', 'measuredValue', 'occurredAt' and 'description' are required",
            });
        }

        try {
            const alert = await alertService.createAlert({
                parameterId,
                measuredValue,
                occurredAt,
                description,
            });

            const fullAlert = await alertService.findAlertById(alert.id);
            if (!fullAlert) {
                return reply.status(500).send({ message: "Alert created but not found" });
            }

            return reply.status(201).send(mapAlertResponse(fullAlert));
        } catch (error) {
            return reply.status(400).send({ message: (error as Error).message });
        }
    };

    update = async (
        request: FastifyRequest<{ Params: AlertParams; Body: Partial<CreateAlertBody> & { status?: "active" | "resolved" } }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "Invalid alert id" });
        }

        try {
            const payload = {
                ...(request.body.parameterId !== undefined ? { parameterId: request.body.parameterId } : {}),
                ...(request.body.measuredValue !== undefined ? { measuredValue: request.body.measuredValue } : {}),
                ...(request.body.occurredAt !== undefined ? { occurredAt: request.body.occurredAt } : {}),
                ...(request.body.description !== undefined ? { description: request.body.description } : {}),
                ...(request.body.status !== undefined ? { status: request.body.status } : {}),
            };

            const updated = await alertService.updateAlert(id, payload);

            if (!updated) {
                return reply.status(404).send({ message: "Alert not found" });
            }

            const fullAlert = await alertService.findAlertById(updated.id);
            if (!fullAlert) {
                return reply.status(500).send({ message: "Updated alert not found" });
            }

            return reply.send(mapAlertResponse(fullAlert));
        } catch (error) {
            return reply.status(400).send({ message: (error as Error).message });
        }
    };

    delete = async (
        request: FastifyRequest<{ Params: AlertParams }>,
        reply: FastifyReply,
    ) => {
        const id = Number(request.params.id);
        if (Number.isNaN(id)) {
            return reply.status(400).send({ message: "Invalid alert id" });
        }

        const deleted = await alertService.deleteAlert(id);
        if (!deleted) {
            return reply.status(404).send({ message: "Alert not found" });
        }

        return reply.status(204).send({ message: "Alert deleted successfully" });
    };

    evaluate = async (
        request: FastifyRequest<{ Body: EvaluateBody }>,
        reply: FastifyReply,
    ) => {
        const { parameterId, measuredValue, occurredAt } = request.body;

        if (!parameterId || measuredValue === undefined || !occurredAt) {
            return reply.status(400).send({
                message: "Fields 'parameterId', 'measuredValue' and 'occurredAt' are required",
            });
        }

        try {
            const generated = await alertService.evaluateMeasurement({
                parameterId,
                measuredValue,
                occurredAt,
            });

            return reply.send({
                generatedCount: generated.length,
                alerts: generated.map(mapAlertResponse),
            });
        } catch (error) {
            return reply.status(400).send({ message: (error as Error).message });
        }
    };
}

export const alertController = new AlertController();
