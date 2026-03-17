import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

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
    entities: ["src/entity/*.ts"], 
    migrations: ["src/migrations/*.ts"],
});

AppDataSource.initialize()
    .then(() => console.log("Data Source inicializado!"))
    .catch((err) => console.error("Erro no Data Source:", err));