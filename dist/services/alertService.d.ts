import { AlertLogEntity } from "../entities/alertLogEntity.js";
export interface CreateAlertInput {
    parameterId: number;
    measuredValue: number;
    occurredAt: string;
    description: string;
}
export interface UpdateAlertInput {
    parameterId?: number;
    measuredValue?: number;
    occurredAt?: string;
    description?: string;
    status?: "active" | "resolved";
}
export interface EvaluateMeasurementInput {
    parameterId: number;
    measuredValue: number;
    occurredAt: string;
}
export declare class AlertService {
    private readonly alertRepository;
    private readonly measurementRepository;
    private readonly parameterRepository;
    private readonly parameterLimitsRepository;
    private readonly parameterTypeRepository;
    private buildAutomaticMessage;
    private toDate;
    private findParameterById;
    listAlerts(): Promise<AlertLogEntity[]>;
    findAlertById(id: number): Promise<AlertLogEntity | null>;
    createAlert(data: CreateAlertInput): Promise<AlertLogEntity>;
    updateAlert(id: number, data: UpdateAlertInput): Promise<AlertLogEntity | null>;
    deleteAlert(id: number): Promise<boolean>;
    evaluateMeasurement(data: EvaluateMeasurementInput): Promise<AlertLogEntity[]>;
}
export declare const alertService: AlertService;
//# sourceMappingURL=alertService.d.ts.map