import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "parameterTypes" })
export class parameterTypeEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 120 })
    name!: string;

    @Column({ type: "varchar", length: 50, name: "json_key" })
    json_key!: string;

    @Column({ type: "varchar", length: 20 })
    unit!: string;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    factor!: number;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    offset!: number;

    @Column({ type: "varchar", length: 120 })
    description?: string;

    @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}