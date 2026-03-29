import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateParametersTable1762860001000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "parameters",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "idStation",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "idTypeParam",
                        type: "integer",
                        isNullable: false,
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
        await queryRunner.dropTable("parameters");
    }
}