import { 
    Column, 
    CreateDateColumn, 
    Entity, 
    PrimaryGeneratedColumn, 
    UpdateDateColumn,
    ManyToOne,
    JoinColumn 
} from "typeorm";
import { StationEntity } from "./stationEntity.js";
import { parameterTypeEntity } from "./parameterTypeEntity.js";

@Entity({ name: "parameters" })
export class ParameterEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "id_station", type: "integer" })
    idStation!: number;

    @Column({ name: "id_parameter_type", type: "integer" })
    idTypeParam!: number;

    @ManyToOne(() => StationEntity)
    @JoinColumn({ name: "id_station" })
    stationRel!: StationEntity;

    @ManyToOne(() => parameterTypeEntity)
    @JoinColumn({ name: "id_parameter_type" })
    typeParamRel!: parameterTypeEntity;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}