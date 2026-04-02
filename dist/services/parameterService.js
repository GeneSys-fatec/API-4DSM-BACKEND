import { AppDataSource } from "../data-source.js";
import { ParameterEntity } from "../entities/parameterEntity.js";
export class ParameterService {
    repository = AppDataSource.getRepository(ParameterEntity);
    async findAll() {
        return this.repository.find({ order: { id: "ASC" } });
    }
    async findById(id) {
        return this.repository.findOneBy({ id });
    }
    async findByStation(idStation) {
        return this.repository.findBy({ idStation });
    }
    async create(data) {
        const parameter = this.repository.create({
            idStation: data.idStation,
            idTypeParam: data.idTypeParam,
        });
        return this.repository.save(parameter);
    }
    async update(id, data) {
        const parameter = await this.findById(id);
        if (!parameter)
            return null;
        Object.assign(parameter, data, { updatedBy: "system" });
        return this.repository.save(parameter);
    }
    async delete(id) {
        const parameter = await this.findById(id);
        if (!parameter)
            return false;
        await this.repository.remove(parameter);
        return true;
    }
}
export const parameterService = new ParameterService();
//# sourceMappingURL=parameterService.js.map