import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateStationsTable1762860000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "stations",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "120",
                        isNullable: false,
                    },
                    {
                        name: "address",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "latitude",
                        type: "varchar",
                        length: "120",
                        isNullable: false,
                    },
                    {
                        name: "longitude",
                        type: "varchar",
                        length: "120",
                        isNullable: false,
                    },
                    {
                        name: "idDatalogger",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "15",
                        isNullable: false,
                    },
                    {
                        name: "isActive",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdBy",
                        type: "varchar",
                        length: "120",
                        default: "'system'",
                    },
                    {
                        name: "updatedBy",
                        type: "varchar",
                        length: "120",
                        default: "'system'",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("stations");
    }
}