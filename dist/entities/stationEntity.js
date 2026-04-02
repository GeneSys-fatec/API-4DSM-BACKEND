var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";
let StationEntity = class StationEntity {
    id;
    name;
    address;
    latitude;
    longitude;
    idDatalogger;
    status;
    isActive;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], StationEntity.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", length: 120 }),
    __metadata("design:type", String)
], StationEntity.prototype, "name", void 0);
__decorate([
    Column({ type: "varchar", length: 255 }),
    __metadata("design:type", String)
], StationEntity.prototype, "address", void 0);
__decorate([
    Column({ type: "varchar", length: 120 }),
    __metadata("design:type", String)
], StationEntity.prototype, "latitude", void 0);
__decorate([
    Column({ type: "varchar", length: 120 }),
    __metadata("design:type", String)
], StationEntity.prototype, "longitude", void 0);
__decorate([
    Column({ type: "varchar", length: 50 }),
    __metadata("design:type", String)
], StationEntity.prototype, "idDatalogger", void 0);
__decorate([
    Column({ type: "varchar", length: 15 }),
    __metadata("design:type", String)
], StationEntity.prototype, "status", void 0);
__decorate([
    Column({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], StationEntity.prototype, "isActive", void 0);
__decorate([
    CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], StationEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], StationEntity.prototype, "updatedAt", void 0);
__decorate([
    Column({ type: "varchar", length: 120, default: "system" }),
    __metadata("design:type", String)
], StationEntity.prototype, "createdBy", void 0);
__decorate([
    Column({ type: "varchar", length: 120, default: "system" }),
    __metadata("design:type", String)
], StationEntity.prototype, "updatedBy", void 0);
StationEntity = __decorate([
    Entity({ name: "stations" })
], StationEntity);
export { StationEntity };
//# sourceMappingURL=stationEntity.js.map