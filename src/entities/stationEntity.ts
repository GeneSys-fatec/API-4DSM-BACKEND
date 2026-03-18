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

	@Column({ type: "varchar", length: 120 })
	name!: string;

	@Column({ type: "varchar", length: 255 })
	address!: string;

	@Column({ type: "varchar", length: 120 })
	latitude!: string;

	@Column({ type: "varchar", length: 120 })
	longitude!: string;

	@Column({ type: "varchar", length: 50 })
	idDatalogger!: string;

	@Column({ type: "varchar", length: 15 })
	status!: string;

	@Column({ type: "boolean", default: true })
	isActive!: boolean;

	@CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	createdAt!: Date;

	@UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	updatedAt!: Date;

	@Column({ type: "varchar", length: 120, default: "system" })
	createdBy!: string;

	@Column({ type: "varchar", length: 120, default: "system" })
	updatedBy!: string;
}
