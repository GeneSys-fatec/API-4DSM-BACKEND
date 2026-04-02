import { AppDataSource } from "../data-source.js";
import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
export class ParameterTypeService {
    repository = AppDataSource.getRepository(parameterTypeEntity);
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
    async create(data) {
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
    async update(id, data) {
        const parameterType = await this.findById(id);
        if (!parameterType) {
            return null;
        }
        Object.assign(parameterType, data);
        return this.repository.save(parameterType);
    }
    async delete(id) {
        const parameterType = await this.findById(id);
        if (!parameterType) {
            return false;
        }
        await this.repository.remove(parameterType);
        return true;
    }
}
export const parameterTypeService = new ParameterTypeService();
//# sourceMappingURL=parameterTypeService.js.map