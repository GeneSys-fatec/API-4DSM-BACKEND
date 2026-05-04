import { AppDataSource } from "../data-source.js";
import { StationEntity } from "../entities/stationEntity.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { ParameterEntity } from "../entities/parameterEntity.js";

export async function seedStations(): Promise<void> {
  const stationRepo = AppDataSource.getRepository(StationEntity);
  const paramTypeRepo = AppDataSource.getRepository(parameterTypeEntity);
  const paramRepo = AppDataSource.getRepository(ParameterEntity);
  const stationsData = [
    {
      name: "Estação Meteorológica SJC",
      address: "São José dos Campos, SP",
      latitude: "-23.1791",
      longitude: "-45.8872",
      idDatalogger: "PLUVIOMETRO-01",
      status: "online",
      isActive: true,
    },
    {
      name: "Estação Qualidade do Ar Jacareí",
      address: "Jacareí, SP",
      latitude: "-23.3053",
      longitude: "-45.9658",
      idDatalogger: "QUALIDADE_AR-01",
      status: "online",
      isActive: true,
    },
    {
      name: "Estação Agrícola Taubaté",
      address: "Taubaté, SP",
      latitude: "-23.0272",
      longitude: "-45.5553",
      idDatalogger: "SOLO-01",
      status: "online",
      isActive: true,
    },
  ];

  try {
    console.log("Verificando estações padrão no banco...");
    const createdStations: StationEntity[] = [];

    for (const data of stationsData) {
      let station = await stationRepo.findOneBy({ idDatalogger: data.idDatalogger });

      if (!station) {
        station = stationRepo.create(data);
        await stationRepo.save(station);
        console.log(`[SEED] Nova estação inserida: ${station.name}`);
      }
      createdStations.push(station);
    }

    const allParameterTypes = await paramTypeRepo.find();

    if (allParameterTypes.length === 0) {
      console.warn("⚠️ Nenhum Tipo de Parâmetro encontrado. Rode o seedParameterTypes primeiro!");
      return;
    }

    let linksCreated = 0;

    for (const station of createdStations) {
    
      const isPluviometro = station.idDatalogger.includes("PLUVIOMETRO");
      const isQualidadeAr = station.idDatalogger.includes("QUALIDADE_AR");
      const isSolo = station.idDatalogger.includes("SOLO");

      for (const pType of allParameterTypes) {
      
        const isChuva = pType.id === 1 || pType.id === 9 || pType.id === 2;
        const isAr = pType.id >= 2 && pType.id <= 5;
        const isTerra = pType.id >= 6 && pType.id <= 8;

        if ((isPluviometro && isChuva) || (isQualidadeAr && isAr) || (isSolo && isTerra)) {
          const linkExists = await paramRepo.findOneBy({
            idStation: station.id,
            idTypeParam: pType.id,
          });

          if (!linkExists) {
            const newLink = paramRepo.create({
              idStation: station.id,
              idTypeParam: pType.id,
            });
            await paramRepo.save(newLink);
            linksCreated++;
          }
        }
      }
    }

    if (linksCreated > 0) {
      console.log(`[SEED] ${linksCreated} novos vínculos de parâmetros criados para as estações.`);
    } else {
      console.log("Nenhum vínculo novo necessário. Estações atualizadas.");
    }
  } catch (error) {
    console.error("Erro ao executar seed de estações:", error);
    throw error;
  }
}