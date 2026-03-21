import { EntityRepository, Repository } from "typeorm";
import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";

@EntityRepository(parameterLimitsEntity)
export class parameterLimitsRepository extends Repository<parameterLimitsEntity> {}