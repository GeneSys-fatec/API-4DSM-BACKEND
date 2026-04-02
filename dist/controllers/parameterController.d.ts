import type { FastifyReply, FastifyRequest } from "fastify";
interface ParameterParams {
    id: string;
}
interface CreateParameterBody {
    idStation: number;
    idTypeParam: number;
    isActive?: boolean;
}
export declare class ParameterController {
    list: (_request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    findByStation: (request: FastifyRequest<{
        Params: {
            idStation: number;
        };
    }>, reply: FastifyReply) => Promise<never>;
    findById: (request: FastifyRequest<{
        Params: ParameterParams;
    }>, reply: FastifyReply) => Promise<never>;
    create: (request: FastifyRequest<{
        Body: CreateParameterBody;
    }>, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest<{
        Params: ParameterParams;
        Body: CreateParameterBody;
    }>, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest<{
        Params: ParameterParams;
    }>, reply: FastifyReply) => Promise<never>;
}
export declare const parameterController: ParameterController;
export {};
//# sourceMappingURL=parameterController.d.ts.map