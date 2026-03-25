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
    synchronize: false, 
    logging: ["query", "error"],
    entities: ["src/entities/*.ts"], 
    migrations: ["src/migrations/*.ts"],
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source inicializado!");
        await seedParameterTypes();
    })
    .catch((err) => console.error("Erro no Data Source:", err));