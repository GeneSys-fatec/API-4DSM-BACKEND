import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "parameterLimits" })
export class parameterLimitsEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "integer" })
    idTypeParam!: number;

    @Column({ type: "numeric", precision: 10, scale: 2  })
    minExpected!: number;

    @Column({ type: "numeric", precision: 10, scale: 2  })
    maxExpected!: number;

    @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}