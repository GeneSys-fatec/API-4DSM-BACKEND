import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { StationEntity } from "./stationEntity.js";
import { parameterTypeEntity } from "./parameterTypeEntity.js";

@Entity({ name: "parameters" })
export class ParameterEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => StationEntity)
    @JoinColumn({ name: "id_station" })
    idStation!: StationEntity;

    @ManyToOne(() => parameterTypeEntity)
    @JoinColumn({ name: "id_parameter_type" })
    idParameterType!: parameterTypeEntity;

    @Column({ type: "varchar", length: 100, nullable: true })
    sensor_model?: string;

    @Column({ type: "boolean", default: true })
    active!: boolean;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}
