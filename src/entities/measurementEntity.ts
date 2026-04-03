import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { ParameterEntity } from "./parameterEntity.js";

@Entity({ name: "measurements" })
export class MeasurementEntity {
    @PrimaryGeneratedColumn("increment", { type: "bigint" })
    id!: number;

    @ManyToOne(() => ParameterEntity)
    @JoinColumn({ name: "id_parameter" })
    idParameter!: ParameterEntity;

    @Column({ name: "raw_value", type: "numeric", precision: 12, scale: 4 })
    rawValue!: number;

    @Column({ type: "numeric", precision: 12, scale: 4 })
    value!: number;

    @Column({ name: "collected_at", type: "timestamptz" })
    collectedAt!: Date;

    @CreateDateColumn({ name: "received_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    receivedAt!: Date;
}
