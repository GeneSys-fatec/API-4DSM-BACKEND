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
      name: "SJC - Centro",
      address: "São José dos Campos, SP",
      latitude: "-23.1791",
      longitude: "-45.8872",
      idDatalogger: "SJC-001",
      status: "online",
      isActive: true,
    },
    {
      name: "SJC - Zona Sul",
      address: "São José dos Campos, SP",
      latitude: "-23.2237",
      longitude: "-45.8906",
      idDatalogger: "SJC-002",
      status: "online",
      isActive: true,
    },
    {
      name: "Jacareí - Industrial",
      address: "Jacareí, SP",
      latitude: "-23.3053",
      longitude: "-45.9658",
      idDatalogger: "JAC-001",
      status: "online",
      isActive: true,
    },
    {
      name: "Taubaté - Independência",
      address: "Taubaté, SP",
      latitude: "-23.0272",
      longitude: "-45.5553",
      idDatalogger: "TAU-001",
      status: "maintenance",
      isActive: true,
    },
  ];

  try {
    console.log("Verificando estações padrão no banco...");
    const createdStations: StationEntity[] = [];

    for (const data of stationsData) {
      let station = await stationRepo.findOneBy({ name: data.name });

      if (!station) {
        station = stationRepo.create(data);
        await stationRepo.save(station);
        console.log(`[SEED] Nova estação inserida: ${station.name}`);
      }
      createdStations.push(station);
    }

    const allParameterTypes = await paramTypeRepo.find();

    if (allParameterTypes.length === 0) {
      console.warn(
        "⚠️ Nenhum Tipo de Parâmetro encontrado. Certifique-se de rodar o seedParameterTypes primeiro!",
      );
      return;
    }

    let linksCreated = 0;

    for (const station of createdStations) {
      for (const pType of allParameterTypes) {
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

    if (linksCreated > 0) {
      console.log(
        `[SEED] ${linksCreated} novos vínculos de parâmetros criados para as estações.`,
      );
    } else {
      console.log("Nenhum vínculo novo necessário. Estações atualizadas.");
    }
  } catch (error) {
    console.error("Erro ao executar seed de estações:", error);
    throw error;
  }
}
