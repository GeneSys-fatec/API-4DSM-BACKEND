import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity({ name: "stations" })
export class StationEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ length: 120 })
	name!: string;

	@Column({ length: 120 })
	city!: string;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
