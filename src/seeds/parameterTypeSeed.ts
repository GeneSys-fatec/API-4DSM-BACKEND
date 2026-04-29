import { AppDataSource } from "../data-source.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";

// Mapeamento EXATO baseado no db.py do Processador Python
export const defaultParameterTypes = [
    { id: 1, name: "Precipitação", json_key: "chuva_mm", unit: "mm", factor: 1, offset: 0, description: "Quantidade de chuva" },
    { id: 2, name: "Umidade do Ar", json_key: "umidade", unit: "%", factor: 1, offset: 0, description: "Umidade relativa do ar" },
    { id: 3, name: "Gás Carbônico (CO2)", json_key: "co2", unit: "ppm", factor: 1, offset: 0, description: "Concentração de CO2" },
    { id: 4, name: "Material Particulado (PM2.5)", json_key: "pm25", unit: "µg/m³", factor: 1, offset: 0, description: "Partículas finas" },
    { id: 5, name: "Qualidade do Ar", json_key: "qualidade_index", unit: "AQI", factor: 1, offset: 0, description: "Índice de Qualidade do Ar" },
    { id: 6, name: "Umidade do Solo", json_key: "umidade_solo", unit: "%", factor: 1, offset: 0, description: "Umidade no solo" },
    { id: 7, name: "pH do Solo", json_key: "ph", unit: "pH", factor: 1, offset: 0, description: "Potencial hidrogeniônico" },
    { id: 8, name: "Temperatura do Solo", json_key: "temp_solo", unit: "°C", factor: 1, offset: 0, description: "Temperatura na terra" },
    { id: 9, name: "Temperatura do Ar", json_key: "temperatura", unit: "°C", factor: 1, offset: 0, description: "Temperatura ambiente" }
];

export async function seedParameterTypes(): Promise<void> {
    const repository = AppDataSource.getRepository(parameterTypeEntity);

    try {
        console.log("Verificando parâmetros padrão no banco...");
        let insertedCount = 0;

        for (const param of defaultParameterTypes) {
            // Verifica pela json_key
            const exists = await repository.findOneBy({ json_key: param.json_key });
            
            if (!exists) {
                // CORREÇÃO AQUI: "offset" agora está entre aspas duplas escapadas no SQL
                await repository.query(
                    `INSERT INTO "parameterTypes" (id, json_key, name, unit, factor, "offset", description) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     ON CONFLICT (id) DO UPDATE SET json_key = EXCLUDED.json_key, name = EXCLUDED.name`,
                    [param.id, param.json_key, param.name, param.unit, param.factor, param.offset, param.description]
                );
                console.log(`[SEED] Novo parâmetro inserido: ${param.name} (ID: ${param.id})`);
                insertedCount++;
            }
        }

        // Atualiza a sequência do PostgreSQL para o próximo ID disponível não dar erro
        await repository.query(`SELECT setval(pg_get_serial_sequence('"parameterTypes"', 'id'), (SELECT MAX(id) FROM "parameterTypes"));`);

        if (insertedCount === 0) {
            console.log("Nenhum parâmetro novo para adicionar. Seed atualizado.");
        } else {
            console.log(`Seed concluído: ${insertedCount} novos parâmetros cadastrados no sistema.`);
        }
    } catch (error) {
        console.error("Erro ao executar seed de parâmetros:", error);
        throw error;
    }
}