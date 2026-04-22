import { AppDataSource } from "../data-source.js";
import { StationEntity } from "../entities/stationEntity.js";
import { Brackets } from "typeorm";
import { normalizeSearchTerm, unaccentedSql } from "../utils/textSearch.js";

export interface CreateStationInput {
	name: string;
	address: string;
	latitude: string;
	longitude: string;
	idDatalogger: string;
	status: string;
	isActive?: boolean;
}

export interface StationListFilters {
	q?: string;
	status?: string;
	isActive?: boolean;
	user?: string;
	idDatalogger?: string;
	from?: Date;
	to?: Date;
}

export class StationService {
	private readonly repository = AppDataSource.getRepository(StationEntity);

	async findAll(filters: StationListFilters = {}): Promise<StationEntity[]> {
		const searchTerm = normalizeSearchTerm(filters.q ?? "");
		const idDataloggerTerm = normalizeSearchTerm(filters.idDatalogger ?? "");
		const userSearchTerm = normalizeSearchTerm(filters.user ?? "");
		const normalizedStatus = filters.status?.trim().toLowerCase() ?? "";

		const hasFilters = Boolean(
			searchTerm ||
			normalizedStatus ||
			userSearchTerm ||
			idDataloggerTerm ||
			filters.from ||
			filters.to ||
			filters.isActive !== undefined,
		);

		if (!hasFilters) {
			return this.repository.find({
				order: {
					id: "ASC",
				},
			});
		}

		const queryBuilder = this.repository
			.createQueryBuilder("station")
			.orderBy("station.id", "ASC");

		if (searchTerm) {
			const term = `%${searchTerm}%`;
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where(`${unaccentedSql("station.name")} LIKE :term`, { term })
						.orWhere(`${unaccentedSql("station.address")} LIKE :term`, { term })
						.orWhere(`${unaccentedSql("station.idDatalogger")} LIKE :term`, { term })
						.orWhere("CAST(station.id AS TEXT) LIKE :term", { term });
				}),
			);
		}

		if (normalizedStatus) {
			queryBuilder.andWhere("LOWER(station.status) = :status", {
				status: normalizedStatus,
			});
		}

		if (filters.isActive !== undefined) {
			queryBuilder.andWhere("station.isActive = :isActive", {
				isActive: filters.isActive,
			});
		}

		if (idDataloggerTerm) {
			queryBuilder.andWhere(`${unaccentedSql("station.idDatalogger")} LIKE :idDatalogger`, {
				idDatalogger: `%${idDataloggerTerm}%`,
			});
		}

		if (userSearchTerm) {
			const userTerm = `%${userSearchTerm}%`;
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where(`${unaccentedSql("station.createdBy")} LIKE :userTerm`, { userTerm }).orWhere(
						`${unaccentedSql("station.updatedBy")} LIKE :userTerm`,
						{ userTerm },
					);
				}),
			);
		}

		if (filters.from) {
			queryBuilder.andWhere("station.createdAt >= :from", {
				from: filters.from,
			});
		}

		if (filters.to) {
			queryBuilder.andWhere("station.createdAt <= :to", {
				to: filters.to,
			});
		}

		return queryBuilder.getMany();
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
