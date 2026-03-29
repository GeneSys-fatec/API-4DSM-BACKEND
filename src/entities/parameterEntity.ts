import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "parameters" })
export class ParameterEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "integer" })
    idStation!: number;

    @Column({ type: "integer" })
    idTypeParam!: number;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}