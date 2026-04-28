import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "parameters" })
export class ParameterEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "integer", name: "id_station" })
    idStation!: number;

    @Column({ type: "integer", name: "id_parameter_type" })
    idTypeParam!: number;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}