import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { seedParameterTypes } from "./seeds/parameterTypeSeed.js";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST!, 
    port: Number(process.env.DB_PORT!),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
    synchronize: true, 
    logging: ["query", "error"],
    entities: ["src/entities/*.ts"],
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source inicializado e sincronizado!");
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            await seedParameterTypes();
            console.log("Seed executado com sucesso!");
        } catch (seedError) {
            console.error("Erro ao executar seed:", seedError);
        }
    })
    .catch((err) => console.error("Erro no Data Source:", err));