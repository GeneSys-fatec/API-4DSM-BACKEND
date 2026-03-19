import { AppDataSource } from "../data-source.js";
import { ParameterEntity } from "../entities/parameterEntity.js";

export interface CreateParameterInput {
    idStation: number;
    idTypeParam: number;
    key: string;
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

    async create(data: CreateParameterInput): Promise<ParameterEntity> {
        const parameter = this.repository.create({
            idStation: data.idStation,
            idTypeParam: data.idTypeParam,
            key: data.key,
        });

        return this.repository.save(parameter);
    }
}

export const parameterService = new ParameterService();
