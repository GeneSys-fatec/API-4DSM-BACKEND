import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MeasurementEntity } from "./measurementEntity.js";
import { ParameterEntity } from "./parameterEntity.js";

export type AlertStatus = "active" | "resolved";

@Entity({ name: "alert_logs" })
export class AlertLogEntity {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    id!: number;

    @ManyToOne(() => ParameterEntity)
    @JoinColumn({ name: "id_parameter" })
    idParameter!: ParameterEntity;

    @ManyToOne(() => MeasurementEntity)
    @JoinColumn({ name: "id_measurement" })
    idMeasurement!: MeasurementEntity;

    @Column({ type: "varchar", length: 255, nullable: true })
    titulo?: string;

    @Column({ type: "text", nullable: true })
    texto?: string;

    @Column({ name: "triggered_value", type: "numeric", precision: 12, scale: 4 })
    triggeredValue!: number;

    @Column({ name: "triggered_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    triggeredAt!: Date;

    @Column({ name: "resolved_at", type: "timestamptz", nullable: true })
    resolvedAt?: Date | null;

    @Column({
        type: "enum",
        enum: ["active", "resolved"],
        enumName: "alert_status_enum",
        default: "active",
    })
    status!: AlertStatus;
}
