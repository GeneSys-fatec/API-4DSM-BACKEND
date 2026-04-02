import type { FastifyReply, FastifyRequest } from "fastify";
interface ParameterLimitsParams {
    id: string;
}
interface CreateParameterLimitsBody {
    idTypeParam: number;
    minExpected: number;
    maxExpected: number;
}
export declare class ParameterLimitsController {
    list: (_request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    findByTypeParam: (request: FastifyRequest<{
        Params: {
            idTypeParam: number;
        };
    }>, reply: FastifyReply) => Promise<never>;
    findById: (request: FastifyRequest<{
        Params: ParameterLimitsParams;
    }>, reply: FastifyReply) => Promise<never>;
    create: (request: FastifyRequest<{
        Body: CreateParameterLimitsBody;
    }>, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest<{
        Params: ParameterLimitsParams;
        Body: Partial<CreateParameterLimitsBody>;
    }>, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest<{
        Params: ParameterLimitsParams;
    }>, reply: FastifyReply) => Promise<never>;
}
export declare const parameterLimitsController: ParameterLimitsController;
export {};
//# sourceMappingURL=parameterLimitsController.d.ts.map