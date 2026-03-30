import { AppDataSource } from "../data-source.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";

export interface CreateParameterLimitsInput {
	idTypeParam: number;
	minExpected: number;
	maxExpected: number;
}

export class ParameterLimitsService {
	private readonly repository = AppDataSource.getRepository(parameterLimitsEntity);

	async findAll(): Promise<parameterLimitsEntity[]> {
		return this.repository.find({
			order: {
				id: "ASC",
			},
		});
	}

	async findById(id: number): Promise<parameterLimitsEntity | null> {
		return this.repository.findOneBy({ id });
	}

	async findByTypeParam(idTypeParam: number): Promise<parameterLimitsEntity[]> {
		return this.repository.findBy({ idTypeParam });
	}

	async create(data: CreateParameterLimitsInput): Promise<parameterLimitsEntity> {
		const parameterLimits = this.repository.create({
			idTypeParam: data.idTypeParam,
			minExpected: data.minExpected,
			maxExpected: data.maxExpected,
		});

		return this.repository.save(parameterLimits);
	}

	async update(id: number, data: Partial<CreateParameterLimitsInput>): Promise<parameterLimitsEntity | null> {
		const parameterLimits = await this.findById(id);

		if (!parameterLimits) {
			return null;
		}

		Object.assign(parameterLimits, data);
		return this.repository.save(parameterLimits);
	}

	async delete(id: number): Promise<boolean> {
		const parameterLimits = await this.findById(id);

		if (!parameterLimits) {
			return false;
		}

		await this.repository.remove(parameterLimits);
		return true;
	}
}

export const parameterLimitsService = new ParameterLimitsService();
