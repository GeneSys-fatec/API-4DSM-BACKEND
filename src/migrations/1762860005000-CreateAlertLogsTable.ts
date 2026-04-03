import type { MigrationInterface, QueryRunner } from "typeorm";
import { Table } from "typeorm";

export class CreateAlertLogsTable1762860005000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "alert_logs",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
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
                        name: "id_measurement",
                        type: "bigint",
                        isNullable: false,
                    },
                    {
                        name: "titulo",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "texto",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "triggered_value",
                        type: "numeric",
                        precision: 12,
                        scale: 4,
                        isNullable: false,
                    },
                    {
                        name: "triggered_at",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "resolved_at",
                        type: "timestamp with time zone",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enumName: "alert_status_enum",
                        enum: ["active", "resolved"],
                        default: "'active'",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["id_parameter"],
                        referencedTableName: "parameters",
                        referencedColumnNames: ["id"],
                    },
                    {
                        columnNames: ["id_measurement"],
                        referencedTableName: "measurements",
                        referencedColumnNames: ["id"],
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("alert_logs");
        await queryRunner.query('DROP TYPE IF EXISTS "alert_status_enum"');
    }
}
