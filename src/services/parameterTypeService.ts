import { AppDataSource } from "../data-source.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
import { Brackets } from "typeorm";
import { normalizeSearchTerm, unaccentedSql } from "../utils/textSearch.js";

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
		const searchTerm = filters.q?.trim().toLowerCase() ?? "";
		const hasFilters = Boolean(searchTerm || filters.from || filters.to);

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

		if (searchTerm) {
			const normalizedTerm = `%${normalizeSearchTerm(searchTerm)}%`;
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where(`${unaccentedSql("parameterType.name")} LIKE :term`, { term: normalizedTerm })
						.orWhere(`${unaccentedSql("parameterType.json_key")} LIKE :term`, { term: normalizedTerm })
						.orWhere(`${unaccentedSql("parameterType.unit")} LIKE :term`, { term: normalizedTerm });
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
