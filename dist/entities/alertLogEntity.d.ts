import { MeasurementEntity } from "./measurementEntity.js";
import { ParameterEntity } from "./parameterEntity.js";
export type AlertStatus = "active" | "resolved";
export declare class AlertLogEntity {
    id: number;
    idParameter: ParameterEntity;
    idMeasurement: MeasurementEntity;
    titulo?: string;
    texto?: string;
    triggeredValue: number;
    triggeredAt: Date;
    resolvedAt?: Date | null;
    status: AlertStatus;
}
//# sourceMappingURL=alertLogEntity.d.ts.map