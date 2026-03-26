import { EntityRepository, Repository } from "typeorm";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";

@EntityRepository(parameterLimitsEntity)
export class parameterLimitsRepository extends Repository<parameterLimitsEntity> {
    static find() {
        throw new Error("Metodo não iplementado");
    }
    static save(limit: never) {
        throw new Error("Metodo não iplementado");
    }
    static findOneBy(arg0: { id: number; }) {
        throw new Error("Metodo não iplementado")
    }
}