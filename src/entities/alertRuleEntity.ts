import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { ParameterEntity } from "./parameterEntity.js";

@Entity("alert_rules")
export class AlertRuleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ParameterEntity, (parameter) => parameter.id, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "id_parameter" })
    id_parameter: number;

    @Column({ type: "varchar", length: 150 })
    name: string;

    @Column({ type: "varchar", length: 10 })
    operator: string;

    @Column({ type: "decimal", precision: 10, scale: 4 })
    p1: number;

    @Column({ type: "decimal", precision: 10, scale: 4, nullable: true })
    p2: number | null;

    @Column({ type: "text", nullable: true })
    message: string | null;

    @Column({ type: "varchar", length: 20 })
    severity: string;

    @Column({ type: "boolean", default: true })
    active: boolean;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;
}
