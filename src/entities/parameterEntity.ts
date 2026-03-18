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

    @Column()
    idStation!: number;

    @Column()
    key!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
