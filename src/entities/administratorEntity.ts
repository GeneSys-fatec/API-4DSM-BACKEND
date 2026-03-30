import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "administrator" })
export class administratorEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 120 })
    name!: string;

    @Column({ type: "varchar", length: 120, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 120 })
    password!: string;

    @Column({ type: "boolean", default: true })
	status!: boolean;

    @CreateDateColumn({ type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt!: Date;
}
