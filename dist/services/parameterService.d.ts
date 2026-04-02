import { ParameterEntity } from "../entities/parameterEntity.js";
export interface CreateParameterInput {
    idStation: number;
    idTypeParam: number;
    isActive?: boolean;
}
export declare class ParameterService {
    private readonly repository;
    findAll(): Promise<ParameterEntity[]>;
    findById(id: number): Promise<ParameterEntity | null>;
    findByStation(idStation: number): Promise<ParameterEntity[]>;
    create(data: CreateParameterInput): Promise<ParameterEntity>;
    update(id: number, data: Partial<CreateParameterInput>): Promise<ParameterEntity | null>;
    delete(id: number): Promise<boolean>;
}
export declare const parameterService: ParameterService;
//# sourceMappingURL=parameterService.d.ts.map