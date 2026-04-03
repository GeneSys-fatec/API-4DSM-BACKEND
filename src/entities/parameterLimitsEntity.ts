import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { parameterTypeEntity } from "./parameterTypeEntity.js";

@Entity({ name: "parameterLimits" })
export class parameterLimitsEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => parameterTypeEntity)
    @JoinColumn({ name: "idTypeParam" })
    idTypeParam!: parameterTypeEntity;

    @Column({ type: "numeric", precision: 10, scale: 2  })
    minExpected!: number;

    @Column({ type: "numeric", precision: 10, scale: 2  })
    maxExpected!: number;

    @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}