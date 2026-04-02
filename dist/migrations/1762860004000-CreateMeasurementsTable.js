import { Table } from "typeorm";
export class CreateMeasurementsTable1762860004000 {
    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: "measurements",
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
                    name: "raw_value",
                    type: "numeric",
                    precision: 12,
                    scale: 4,
                    isNullable: false,
                },
                {
                    name: "value",
                    type: "numeric",
                    precision: 12,
                    scale: 4,
                    isNullable: false,
                },
                {
                    name: "collected_at",
                    type: "timestamp with time zone",
                    isNullable: false,
                },
                {
                    name: "received_at",
                    type: "timestamp with time zone",
                    default: "CURRENT_TIMESTAMP",
                },
            ],
            foreignKeys: [
                {
                    columnNames: ["id_parameter"],
                    referencedTableName: "parameters",
                    referencedColumnNames: ["id"],
                },
            ],
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("measurements");
    }
}
//# sourceMappingURL=1762860004000-CreateMeasurementsTable.js.map