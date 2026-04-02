import { Table } from "typeorm";
export class CreateParameterLimitsTable1762860003000 {
    async up(queryRunner) {
        await queryRunner.createTable(new Table({
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
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable("parameterLimits");
    }
}
//# sourceMappingURL=1762860003000-CreateParameterLimitsTable.js.map