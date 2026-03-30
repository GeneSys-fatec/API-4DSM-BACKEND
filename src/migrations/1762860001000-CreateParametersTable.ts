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
                        type: "serial",
                        isPrimary: true,
                    },
                    {
                        name: "id_station",
                        type: "integer",
                    },
                    {
                        name: "id_parameter_type",
                        type: "integer",
                    },
                    {
<<<<<<< HEAD
                        name: "createdAt",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp with time zone",
                        default: "CURRENT_TIMESTAMP",
=======
                        name: "sensor_model",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamptz",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamptz",
                        default: "now()",
>>>>>>> 1f611c90cad980483c4e7ff0f69f48c2ab6f2a78
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["id_station"],
                        referencedTableName: "stations",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["id_parameter_type"],
                        referencedTableName: "parameterTypes",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("parameters");
    }
}