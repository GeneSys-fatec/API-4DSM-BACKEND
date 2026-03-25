import { AppDataSource } from "../data-source.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";

export const defaultParameterTypes = [
    {
        name: "Temperatura",
        key: "temp",
        unit: "°C",
        factor: 0.1,
        offset: -40,
        description: "Temperatura ambiente em graus Celsius",
    },
    {
        name: "Umidade",
        key: "umid",
        unit: "%",
        factor: 0.5,
        offset: 0,
        description: "Umidade relativa do ar em percentual",
    },
    {
        name: "Pressão Atmosférica",
        key: "press",
        unit: "hPa",
        factor: 1,
        offset: 300,
        description: "Pressão atmosférica em hectopascais",
    },
    {
        name: "Precipitação",
        key: "prec",
        unit: "mm",
        factor: 0.2,
        offset: 0,
        description: "Quantidade de chuva em milímetros",
    }
];

export async function seedParameterTypes(): Promise<void> {
    const repository = AppDataSource.getRepository(parameterTypeEntity);

    try {
        const existingCount = await repository.count();

        if (existingCount === 0) {
            await repository.insert(defaultParameterTypes);
        } else {
            console.log("Tipos de parâmetros já existem no banco. Seed ignorado.");
        }
    } catch (error) {
        console.error("Erro ao executar seed:", error);
        throw error;
    }
}
