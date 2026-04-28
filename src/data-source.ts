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
    synchronize: false,
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
    console.log("Data Source inicializado!");

    try {
        console.log("Executando migrations...");
        await AppDataSource.runMigrations();
        console.log("Migrations executadas com sucesso!");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("Executando seeds...");
        await seedParameterTypes();
        await seedStations(); 
        await seedAdministrator();
        console.log("Seeds executados com sucesso!");
    } catch (error) {
        console.error("Erro ao executar migrations ou seeds:", error);
        throw error;
    }
}