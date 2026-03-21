import "reflect-metadata";
import fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./routes.js";

export const app = fastify({logger: true})

const start = async() => {

    await app.register(cors, {
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
        optionsSuccessStatus: 204,
        strictPreflight: false,
    });
    await app.register(routes);

    try{
        await app.listen({ port: 3333, host: '0.0.0.0'})
    }
    catch(err){
        process.exit(1)
    }
}

start();