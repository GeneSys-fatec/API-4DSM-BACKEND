import type { FastifyRequest, FastifyReply } from "fastify";
import openMeteoService from "../services/openMeteoService.js";
// import { StationEntity } from "../entities/stationEntity";
// import { AppDataSource } from "../services/data-source"; 

export class WeatherController {
	async getCurrentWeather(
		req: FastifyRequest<{ Params: { stationId: string } }>, 
		reply: FastifyReply
	) {
		try {
			const { stationId } = req.params;

			// TODO: Remover mock de coordenadas e integrar com o banco real (StationEntity) quando o DB estiver populado

			// ==========================================
			// MOCK PARA TESTES: IGNORANDO O BANCO DE DADOS
            // Coordenadas reais do centro de São José dos Campos
			// ==========================================
			const mockLatitude = "-23.1791";
			const mockLongitude = "-45.8872";


			//======================== APAGAR MOCK ==========================


			/*
			const stationRepository = AppDataSource.getRepository(StationEntity);
			const station = await stationRepository.findOneBy({ id: Number(stationId) });

			if (!station || !station.latitude || !station.longitude) {
				return reply.status(404).send({ message: "Estação não encontrada ou sem coordenadas." });
			}
            const latitudePraUsar = station.latitude;
            const longitudePraUsar = station.longitude;
			*/

			const weatherData = await openMeteoService.fetchCurrentWeather(
				mockLatitude, 
				mockLongitude
			);

			// 4. Devolve o JSON pro front
			return reply.status(200).send(weatherData);

		} catch (error) {
			console.error("Erro no WeatherController:", error);
			return reply.status(500).send({ message: "Erro interno ao buscar dados climáticos." });
		}
	}
}

export default new WeatherController();