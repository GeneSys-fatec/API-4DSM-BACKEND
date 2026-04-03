import { AppDataSource } from "../data-source.js";
import { StationEntity } from "../entities/stationEntity.js";

export interface CreateStationInput {
	name: string;
	address: string;
	latitude: string;
	longitude: string;
	idDatalogger: string;
	status: string;
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

	async findByAddress(address: string): Promise<StationEntity[]> {
		return this.repository.findBy({ address });	
	}

	async findById(id: number): Promise<StationEntity | null> {
		return this.repository.findOneBy({ id });
	}

	async create(data: CreateStationInput): Promise<StationEntity> {
		const station = this.repository.create({
			name: data.name,
			address: data.address,
			latitude: data.latitude,
			longitude: data.longitude,
			idDatalogger: data.idDatalogger,
			status: data.status,
			isActive: data.isActive ?? true,
			createdBy: "system",
			updatedBy: "system",
		});

		return this.repository.save(station);
	}

	async update(id: number, data: Partial<CreateStationInput>): Promise<StationEntity | null> {
		const station = await this.findById(id);
		if (!station) {
			return null;
		}

		Object.assign(station, data, { updatedBy: "system" });
		return this.repository.save(station);
	}

	async delete(id: number): Promise<boolean> {
		const station = await this.findById(id);
		if (!station) {
			return false;
		}

		await this.repository.remove(station);
		return true;
	}

}

export const stationService = new StationService();
