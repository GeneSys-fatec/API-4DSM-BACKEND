var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from "typeorm";
import { ParameterEntity } from "./parameterEntity.js";
let MeasurementEntity = class MeasurementEntity {
    id;
    idParameter;
    rawValue;
    value;
    collectedAt;
    receivedAt;
};
__decorate([
    PrimaryGeneratedColumn("increment", { type: "bigint" }),
    __metadata("design:type", Number)
], MeasurementEntity.prototype, "id", void 0);
__decorate([
    ManyToOne(() => ParameterEntity),
    JoinColumn({ name: "id_parameter" }),
    __metadata("design:type", ParameterEntity)
], MeasurementEntity.prototype, "idParameter", void 0);
__decorate([
    Column({ name: "raw_value", type: "numeric", precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], MeasurementEntity.prototype, "rawValue", void 0);
__decorate([
    Column({ type: "numeric", precision: 12, scale: 4 }),
    __metadata("design:type", Number)
], MeasurementEntity.prototype, "value", void 0);
__decorate([
    Column({ name: "collected_at", type: "timestamptz" }),
    __metadata("design:type", Date)
], MeasurementEntity.prototype, "collectedAt", void 0);
__decorate([
    CreateDateColumn({ name: "received_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], MeasurementEntity.prototype, "receivedAt", void 0);
MeasurementEntity = __decorate([
    Entity({ name: "measurements" })
], MeasurementEntity);
export { MeasurementEntity };
//# sourceMappingURL=measurementEntity.js.map