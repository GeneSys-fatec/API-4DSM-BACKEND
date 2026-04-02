import { StationEntity } from "../entities/stationEntity.js";
export interface CreateStationInput {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    idDatalogger: string;
    status: string;
    isActive?: boolean;
}
export declare class StationService {
    private readonly repository;
    findAll(): Promise<StationEntity[]>;
    findByName(name: string): Promise<StationEntity | null>;
    findByAddress(address: string): Promise<StationEntity[]>;
    findById(id: number): Promise<StationEntity | null>;
    create(data: CreateStationInput): Promise<StationEntity>;
    update(id: number, data: Partial<CreateStationInput>): Promise<StationEntity | null>;
    delete(id: number): Promise<boolean>;
}
export declare const stationService: StationService;
//# sourceMappingURL=stationService.d.ts.map