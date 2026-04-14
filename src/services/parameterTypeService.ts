import { AppDataSource } from "../data-source.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { Brackets } from "typeorm";

export interface CreateParameterTypeInput {
	json_key: string;
	name: string;
	unit: string;
	factor: number;
	offset: number;
	description: string;
}

export interface ParameterTypeListFilters {
	q?: string;
	from?: Date;
	to?: Date;
}

export class ParameterTypeService {
	private readonly repository = AppDataSource.getRepository(parameterTypeEntity);

	async findAll(filters: ParameterTypeListFilters = {}): Promise<parameterTypeEntity[]> {
		const hasFilters = Boolean(filters.q || filters.from || filters.to);

		if (!hasFilters) {
			return this.repository.find({
				order: {
					id: "ASC",
				},
			});
		}

		const queryBuilder = this.repository
			.createQueryBuilder("parameterType")
			.orderBy("parameterType.id", "ASC");

		if (filters.q) {
			const term = `%${filters.q.trim().toLowerCase()}%`;
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where("LOWER(parameterType.name) LIKE :term", { term })
						.orWhere("LOWER(parameterType.json_key) LIKE :term", { term })
						.orWhere("LOWER(parameterType.unit) LIKE :term", { term })
						.orWhere("LOWER(parameterType.description) LIKE :term", { term });
				}),
			);
		}

		if (filters.from) {
			queryBuilder.andWhere("parameterType.createdAt >= :from", {
				from: filters.from,
			});
		}

		if (filters.to) {
			queryBuilder.andWhere("parameterType.createdAt <= :to", {
				to: filters.to,
			});
		}

		return queryBuilder.getMany();
	}

	async findById(id: number): Promise<parameterTypeEntity | null> {
		return this.repository.findOneBy({ id });
	}

	async create(data: CreateParameterTypeInput): Promise<parameterTypeEntity> {
		const parameterType = this.repository.create({
			json_key: data.json_key,
			name: data.name,
			unit: data.unit,
			factor: data.factor,
			offset: data.offset,
			description: data.description,
		});

		return this.repository.save(parameterType);
	}

	async update(id: number, data: Partial<CreateParameterTypeInput>): Promise<parameterTypeEntity | null> {
		const parameterType = await this.findById(id);

		if (!parameterType) {
			return null;
		}

		Object.assign(parameterType, data);
		return this.repository.save(parameterType);
	}

	async delete(id: number): Promise<boolean> {
		const parameterType = await this.findById(id);

		if (!parameterType) {
			return false;
		}

		await this.repository.remove(parameterType);
		return true;
	}
}

export const parameterTypeService = new ParameterTypeService();
