import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateParameterTypesTable1762860002000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "parameterTypes",
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
                        name: "json_key",
                        type: "varchar",
                        length: "50",
                        isNullable: false,
                    },
                    {
                        name: "unit",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                    },
                    {
                        name: "factor",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "offset",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "description",
                        type: "varchar",
                        length: "120",
                        isNullable: true,
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
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("parameterTypes");
    }
}