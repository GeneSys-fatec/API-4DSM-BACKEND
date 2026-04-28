import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 150 })
    name: string;

    @Column({ type: "varchar", length: 150, unique: true })
    email: string;

    @Column({ type: "varchar", length: 255 })
    password_hash: string;

    @Column({ type: "boolean", default: true })
    status: boolean;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;
}
