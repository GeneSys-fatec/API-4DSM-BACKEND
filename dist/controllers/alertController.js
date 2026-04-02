import { alertService } from "../services/alertService.js";
function mapAlertResponse(alert) {
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
    list = async (_request, reply) => {
        const alerts = await alertService.listAlerts();
        return reply.send(alerts.map(mapAlertResponse));
    };
    create = async (request, reply) => {
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
        }
        catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    };
    update = async (request, reply) => {
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
        }
        catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    };
    delete = async (request, reply) => {
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
    evaluate = async (request, reply) => {
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
        }
        catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    };
}
export const alertController = new AlertController();
//# sourceMappingURL=alertController.js.map