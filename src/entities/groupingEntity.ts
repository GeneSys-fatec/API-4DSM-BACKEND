import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
} from "typeorm";

@Entity("groupings")
export class GroupingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 150 })
    name: string;

    @Column({ type: "text", nullable: true })
    description: string | null;
}
