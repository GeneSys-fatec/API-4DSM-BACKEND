import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "parameters" })
export class ParameterEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    //ver questão de chave estrangeira para estação, notation  e talz
    @Column({ type: "integer" })
    idStation!: number;

    //ver questão de chave estrangeira para tipo de parâmetro e mesma oic
    @Column({ type: "integer" })
    idTypeParam!: number;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}
