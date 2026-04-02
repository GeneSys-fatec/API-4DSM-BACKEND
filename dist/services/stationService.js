import { AppDataSource } from "../data-source.js";
import { StationEntity } from "../entities/stationEntity.js";
export class StationService {
    repository = AppDataSource.getRepository(StationEntity);
    async findAll() {
        return this.repository.find({
            order: {
                id: "ASC",
            },
        });
    }
    async findByName(name) {
        return this.repository.findOneBy({ name });
    }
    async findByAddress(address) {
        return this.repository.findBy({ address });
    }
    async findById(id) {
        return this.repository.findOneBy({ id });
    }
    async create(data) {
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
    async update(id, data) {
        const station = await this.findById(id);
        if (!station) {
            return null;
        }
        Object.assign(station, data, { updatedBy: "system" });
        return this.repository.save(station);
    }
    async delete(id) {
        const station = await this.findById(id);
        if (!station) {
            return false;
        }
        await this.repository.remove(station);
        return true;
    }
}
export const stationService = new StationService();
//# sourceMappingURL=stationService.js.map