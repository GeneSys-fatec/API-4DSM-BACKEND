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
                        type: "serial",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                        isNullable: false,
                    },
                    {
                        name: "address",
                        type: "varchar",
                        length: "255",
                    },
                    {
                        name: "latitude",
                        type: "decimal",
                        precision: 10,
                        scale: 8,
                        isNullable: false,
                    },
                    {
                        name: "longitude",
                        type: "decimal",
                        precision: 10,
                        scale: 8,
                        isNullable: false,
                    },
                    {
                        name: "id_datalogger",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "id_usuario",
                        type: "integer",
                    },
                    {
                        name: "status",
                        type: "boolean",
                        isNullable: false,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        isNullable: false,
                        default: "now()",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("stations");
    }
}
