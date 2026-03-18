import { AppDataSource } from "../data-source.js";
import { StationEntity } from "../entities/stationEntity.js";

export interface CreateStationInput {
	name: string;
	city: string;
	isActive?: boolean;
}

export class StationService {
	private readonly repository = AppDataSource.getRepository(StationEntity);

	async findAll(): Promise<StationEntity[]> {
		return this.repository.find({
			order: {
				id: "ASC",
			},
		});
	}

	async findByName(name: string): Promise<StationEntity | null> {
		return this.repository.findOneBy({ name });
	}

	async findByCity(city: string): Promise<StationEntity[]> {
		return this.repository.findBy({ city });	
	}

	async findById(id: number): Promise<StationEntity | null> {
		return this.repository.findOneBy({ id });
	}

	async create(data: CreateStationInput): Promise<StationEntity> {
		const station = this.repository.create({
			name: data.name,
			city: data.city,
			isActive: data.isActive ?? true,
		});

		return this.repository.save(station);
	}
}

export const stationService = new StationService();
