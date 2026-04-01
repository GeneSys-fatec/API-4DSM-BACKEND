import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateParameterLimitsTable1762860003000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "parameterLimits",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "idTypeParam",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "minExpected",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "maxExpected",
                        type: "numeric",
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("parameterLimits");
    }
}
