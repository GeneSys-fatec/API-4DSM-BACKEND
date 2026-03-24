import { AppDataSource } from "../data-source.js";
import { ParameterEntity } from "../entities/parameterEntity.js";

export interface CreateParameterInput {
    idStation: number;
    idTypeParam: number;
    isActive?: boolean;
}

export class ParameterService {
    private readonly repository = AppDataSource.getRepository(ParameterEntity);

    async findAll(): Promise<ParameterEntity[]> {
        return this.repository.find({
            order: {
                id: "ASC",
            },
        });
    }

    async findById(id: number): Promise<ParameterEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async findByStation(idStation: number): Promise<ParameterEntity[]> {
        return this.repository.findBy({ idStation });
    }

    async create(data: CreateParameterInput): Promise<ParameterEntity> {
        const parameter = this.repository.create({
            idStation: data.idStation,
            idTypeParam: data.idTypeParam,
        });

        return this.repository.save(parameter);
    }

    async update(id: number, data: Partial<CreateParameterInput>): Promise<ParameterEntity | null> {
        const parameter = await this.findById(id);
        if (!parameter) {
			return null;
		}

        Object.assign(parameter, data, { updatedBy: "system" });
		return this.repository.save(parameter);
    }

    async delete(id: number): Promise<boolean> {
        const parameter = await this.findById(id);
        if (!parameter) {
			return false;
		}

        await this.repository.remove(parameter);
		return true;
    }
}

export const parameterService = new ParameterService();
