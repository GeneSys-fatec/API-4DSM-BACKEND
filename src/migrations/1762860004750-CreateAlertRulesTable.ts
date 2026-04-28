import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateAlertRulesTable1762860004750 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "alert_rules",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "id_parameter",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "150",
                        isNullable: false,
                    },
                    {
                        name: "operator",
                        type: "varchar",
                        length: "10",
                        isNullable: false,
                    },
                    {
                        name: "p1",
                        type: "decimal",
                        precision: 10,
                        scale: 4,
                        isNullable: false,
                    },
                    {
                        name: "p2",
                        type: "decimal",
                        precision: 10,
                        scale: 4,
                        isNullable: true,
                    },
                    {
                        name: "message",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "severity",
                        type: "varchar",
                        length: "20",
                        isNullable: false,
                    },
                    {
                        name: "active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["id_parameter"],
                        referencedTableName: "parameters",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("alert_rules");
    }
}
