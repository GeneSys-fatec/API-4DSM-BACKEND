import { parameterTypeEntity } from "../entities/parameterTypeEntity.js";
export interface CreateParameterTypeInput {
    json_key: string;
    name: string;
    unit: string;
    factor: number;
    offset: number;
    description: string;
}
export declare class ParameterTypeService {
    private readonly repository;
    findAll(): Promise<parameterTypeEntity[]>;
    findById(id: number): Promise<parameterTypeEntity | null>;
    create(data: CreateParameterTypeInput): Promise<parameterTypeEntity>;
    update(id: number, data: Partial<CreateParameterTypeInput>): Promise<parameterTypeEntity | null>;
    delete(id: number): Promise<boolean>;
}
export declare const parameterTypeService: ParameterTypeService;
//# sourceMappingURL=parameterTypeService.d.ts.map