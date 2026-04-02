import { AppDataSource } from "../data-source.js";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";
export class ParameterLimitsService {
    repository = AppDataSource.getRepository(parameterLimitsEntity);
    async findAll() {
        return this.repository.find({
            order: {
                id: "ASC",
            },
        });
    }
    async findById(id) {
        return this.repository.findOneBy({ id });
    }
    async findByTypeParam(idTypeParam) {
        return this.repository.findBy({ idTypeParam });
    }
    async create(data) {
        const parameterLimits = this.repository.create({
            idTypeParam: data.idTypeParam,
            minExpected: data.minExpected,
            maxExpected: data.maxExpected,
        });
        return this.repository.save(parameterLimits);
    }
    async update(id, data) {
        const parameterLimits = await this.findById(id);
        if (!parameterLimits) {
            return null;
        }
        Object.assign(parameterLimits, data);
        return this.repository.save(parameterLimits);
    }
    async delete(id) {
        const parameterLimits = await this.findById(id);
        if (!parameterLimits) {
            return false;
        }
        await this.repository.remove(parameterLimits);
        return true;
    }
}
export const parameterLimitsService = new ParameterLimitsService();
//# sourceMappingURL=parameterLimitsService.js.map