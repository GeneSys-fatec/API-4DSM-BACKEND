import type { FastifyReply, FastifyRequest } from "fastify";
interface StationParams {
    id: string;
}
interface CreateStationBody {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    idDatalogger: string;
    status: string;
    isActive?: boolean;
}
export declare class StationController {
    list: (_request: FastifyRequest, reply: FastifyReply) => Promise<never>;
    findByAddress: (request: FastifyRequest<{
        Params: {
            address: string;
        };
    }>, reply: FastifyReply) => Promise<never>;
    findById: (request: FastifyRequest<{
        Params: StationParams;
    }>, reply: FastifyReply) => Promise<never>;
    create: (request: FastifyRequest<{
        Body: CreateStationBody;
    }>, reply: FastifyReply) => Promise<never>;
    update: (request: FastifyRequest<{
        Params: StationParams;
        Body: CreateStationBody;
    }>, reply: FastifyReply) => Promise<never>;
    delete: (request: FastifyRequest<{
        Params: StationParams;
    }>, reply: FastifyReply) => Promise<never>;
}
export declare const stationController: StationController;
export {};
//# sourceMappingURL=stationController.d.ts.map