import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { seedParameterTypes } from "./seeds/parameterTypeSeed.js";
import { seedAdministrator } from "./seeds/administratorSeed.js";
import { seedStations } from "./seeds/stationSeed.js"; 

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST!, 
    port: Number(process.env.DB_PORT!),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_DATABASE!,
    synchronize: true,
    dropSchema: false,
    logging: ["query", "error"],
    entities: ["src/entities/*.ts"],
    migrations: ["src/migrations/*.ts"],
    // ssl: {
    //     rejectUnauthorized: false,
    // },
});

export async function initializeDatabase(): Promise<void> {
    if (AppDataSource.isInitialized) {
        return;
    }

    await AppDataSource.initialize();
    console.log("Data Source inicializado e sincronizado!");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
        await seedParameterTypes();
        await seedStations(); 
        await seedAdministrator();
        console.log("Seeds executados com sucesso!");
    } catch (seedError) {
        console.error("Erro ao executar seeds:", seedError);
        throw seedError;
    }
}