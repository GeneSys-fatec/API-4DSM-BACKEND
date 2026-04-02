import { AppDataSource } from "../data-source.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
export const defaultParameterTypes = [
    {
        name: "Temperatura",
        json_key: "temperature_2m",
        unit: "°C",
        factor: 1,
        offset: 0,
        description: "Temperatura a 2 metros do solo",
    },
    {
        name: "Umidade",
        json_key: "relative_humidity_2m",
        unit: "%",
        factor: 1,
        offset: 0,
        description: "Umidade relativa do ar",
    },
    {
        name: "Velocidade do Vento",
        json_key: "wind_speed_10m",
        unit: "km/h",
        factor: 1,
        offset: 0,
        description: "Velocidade do vento a 10 metros",
    },
    {
        name: "Precipitação",
        json_key: "precipitation",
        unit: "mm",
        factor: 1,
        offset: 0,
        description: "Quantidade de chuva em milímetros",
    },
    {
        name: "Sensação Térmica",
        json_key: "apparent_temperature",
        unit: "°C",
        factor: 1,
        offset: 0,
        description: "Sensação térmica percebida humana",
    },
    {
        name: "Pressão Atmosférica",
        json_key: "surface_pressure",
        unit: "hPa",
        factor: 1,
        offset: 0,
        description: "Pressão atmosférica na superfície",
    },
    {
        name: "Cobertura de Nuvens",
        json_key: "cloud_cover",
        unit: "%",
        factor: 1,
        offset: 0,
        description: "Percentual do céu coberto por nuvens",
    },
    {
        name: "Rajadas de Vento",
        json_key: "wind_gusts_10m",
        unit: "km/h",
        factor: 1,
        offset: 0,
        description: "Velocidade máxima das rajadas de vento",
    },
    {
        name: "Radiação Solar",
        json_key: "shortwave_radiation",
        unit: "W/m²",
        factor: 1,
        offset: 0,
        description: "Radiação solar de ondas curtas",
    }
];
export async function seedParameterTypes() {
    const repository = AppDataSource.getRepository(parameterTypeEntity);
    try {
        console.log("Verificando parâmetros padrão no banco...");
        let insertedCount = 0;
        for (const param of defaultParameterTypes) {
            const exists = await repository.findOneBy({ json_key: param.json_key });
            if (!exists) {
                await repository.insert(param);
                console.log(`[SEED] Novo parâmetro inserido: ${param.name}`);
                insertedCount++;
            }
        }
        if (insertedCount === 0) {
            console.log("Nenhum parâmetro novo para adicionar. Seed atualizado.");
        }
        else {
            console.log(`Seed concluído: ${insertedCount} novos parâmetros cadastrados no sistema.`);
        }
    }
    catch (error) {
        console.error("Erro ao executar seed:", error);
        throw error;
    }
}
//# sourceMappingURL=parameterTypeSeed.js.map