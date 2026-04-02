var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from "typeorm";
import { MeasurementEntity } from "./measurementEntity.js";
import { ParameterEntity } from "./parameterEntity.js";
let AlertLogEntity = class AlertLogEntity {
    id;
    idParameter;
    idMeasurement;
    titulo;
    texto;
    triggeredValue;
    triggeredAt;
    resolvedAt;
    status;
};
__decorate([
    PrimaryGeneratedColumn("increment", { type: "bigint" }),
    __metadata("design:type", Number)
], AlertLogEntity.prototype, "id", void 0);
__decorate([
    ManyToOne(() => ParameterEntity),
    JoinColumn({ name: "id_parameter" }),
    __metadata("design:type", ParameterEntity)
], AlertLogEntity.prototype, "idParameter", void 0);
__decorate([
    ManyToOne(() => MeasurementEntity),
    JoinColumn({ name: "id_measurement" }),
    __metadata("design:type", MeasurementEntity)
], AlertLogEntity.prototype, "idMeasurement", void 0);
__decorate([
    Column({ type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], AlertLogEntity.prototype, "titulo", void 0);
__decorate([
    Column({ type: "text", nullable: true }),
    __metadata("design:type", String)
], AlertLogEntity.prototype, "texto", void 0);
__decorate([
    Column({ name: "triggered_value", type: "numeric", precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], AlertLogEntity.prototype, "triggeredValue", void 0);
__decorate([
    Column({ name: "triggered_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], AlertLogEntity.prototype, "triggeredAt", void 0);
__decorate([
    Column({ name: "resolved_at", type: "timestamptz", nullable: true }),
    __metadata("design:type", Object)
], AlertLogEntity.prototype, "resolvedAt", void 0);
__decorate([
    Column({
        type: "enum",
        enum: ["active", "resolved"],
        enumName: "alert_status_enum",
        default: "active",
    }),
    __metadata("design:type", String)
], AlertLogEntity.prototype, "status", void 0);
AlertLogEntity = __decorate([
    Entity({ name: "alert_logs" })
], AlertLogEntity);
export { AlertLogEntity };
//# sourceMappingURL=alertLogEntity.js.map