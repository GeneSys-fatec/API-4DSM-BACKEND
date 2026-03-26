import { Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("parameterLimits")
export class parameterLimitsEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // Verificar como vai puxar esses parâmetros!
    @Column({type: "json"})
    parameter!: string;

    @Column({type: "float"})
    maxValue!: number;

    @Column({ type: "float" })
    minValue!: number;

    @Column({length: 120})
    unit!: string;

    @Column()
    createdBy!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}