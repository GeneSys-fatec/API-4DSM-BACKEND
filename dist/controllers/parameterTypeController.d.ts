import type { FastifyReply, FastifyRequest } from "fastify";
interface ParameterTypeParams {
    id: string;
}
interface CreateParameterTypeBody {
    json_key: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description?: string;
}
export declare class ParameterTypeController {
    list: (_request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    findById: (request: FastifyRequest<{
        Params: ParameterTypeParams;
    }>, reply: FastifyReply) => Promise<never>;
    create: (request: FastifyRequest<{
        Body: CreateParameterTypeBody;
    }>, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest<{
        Params: ParameterTypeParams;
        Body: Partial<CreateParameterTypeBody>;
    }>, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest<{
        Params: ParameterTypeParams;
    }>, reply: FastifyReply) => Promise<never>;
}
export declare const parameterTypeController: ParameterTypeController;
export {};
//# sourceMappingURL=parameterTypeController.d.ts.map