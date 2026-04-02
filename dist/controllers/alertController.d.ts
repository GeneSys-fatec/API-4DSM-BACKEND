import type { FastifyReply, FastifyRequest } from "fastify";
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
export declare class AlertController {
    list: (_request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    create: (request: FastifyRequest<{
        Body: CreateAlertBody;
    }>, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest<{
        Params: AlertParams;
        Body: Partial<CreateAlertBody> & {
            status?: "active" | "resolved";
        };
    }>, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest<{
        Params: AlertParams;
    }>, reply: FastifyReply) => Promise<never>;
    evaluate: (request: FastifyRequest<{
        Body: EvaluateBody;
    }>, reply: FastifyReply) => Promise<never>;
}
export declare const alertController: AlertController;
export {};
//# sourceMappingURL=alertController.d.ts.map