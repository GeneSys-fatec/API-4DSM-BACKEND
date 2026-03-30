export {};

declare module "fastify" {
    export interface FastifyRequest {
        user?: {id: number, email: string, iat: number, exp: number};
    }
}