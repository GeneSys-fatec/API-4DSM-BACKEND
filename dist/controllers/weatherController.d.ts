import type { FastifyRequest, FastifyReply } from "fastify";
export declare class WeatherController {
    getCurrentWeather(req: FastifyRequest<{
        Params: {
            stationId: string;
        };
    }>, reply: FastifyReply): Promise<never>;
}
declare const _default: WeatherController;
export default _default;
//# sourceMappingURL=weatherController.d.ts.map