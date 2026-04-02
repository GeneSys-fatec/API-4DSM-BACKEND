import { parameterLimitsEntity } from "../entities/parameterLimitsEntity.js";
export interface CreateParameterLimitsInput {
    idTypeParam: number;
    minExpected: number;
    maxExpected: number;
}
export declare class ParameterLimitsService {
    private readonly repository;
    findAll(): Promise<parameterLimitsEntity[]>;
    findById(id: number): Promise<parameterLimitsEntity | null>;
    findByTypeParam(idTypeParam: number): Promise<parameterLimitsEntity[]>;
    create(data: CreateParameterLimitsInput): Promise<parameterLimitsEntity>;
    update(id: number, data: Partial<CreateParameterLimitsInput>): Promise<parameterLimitsEntity | null>;
    delete(id: number): Promise<boolean>;
}
export declare const parameterLimitsService: ParameterLimitsService;
//# sourceMappingURL=parameterLimitsService.d.ts.map