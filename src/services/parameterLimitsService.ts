import { AppDataSource } from "../data-source.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";

export const parameterLimitsRepository = AppDataSource.getRepository(parameterLimitsEntity);

export class ParameterLimitsService {
    private repository = parameterLimitsRepository;

    async create(parameterLimit: Partial<parameterLimitsEntity>): Promise<parameterLimitsEntity> {
        const newLimit = this.repository.create(parameterLimit);
        return await this.repository.save(newLimit);
    }
    
    async findAll(): Promise<parameterLimitsEntity[]> {
        return await this.repository.find();
    }

    async findById(id: number): Promise<parameterLimitsEntity | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async update(id: number, parameterLimit: Partial<parameterLimitsEntity>): Promise<parameterLimitsEntity | undefined> {
        const existingLimit = await this.repository.findOne({ where: { id } });
        if (!existingLimit) return undefined;

        Object.assign(existingLimit, parameterLimit);
        return await this.repository.save(existingLimit);
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected !== 0;
    }

  async updateLimit(id: number, minLimit: number, maxLimit: number) {
    const limit = await parameterLimitsRepository.findOneBy({ id });
    if (!limit) throw new Error("Limit not found");

    limit.minValue = minLimit;
    limit.maxValue = maxLimit;

    return await parameterLimitsRepository.save(limit);
  }

    async getLimits() {
        return await parameterLimitsRepository.find();
    }

}