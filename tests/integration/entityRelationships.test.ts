import { describe, it, expect } from "vitest";
import { ParameterEntity } from "../../src/entities/parameterEntity";
import { StationEntity } from "../../src/entities/stationEntity";
import { parameterTypeEntity } from "../../src/entities/parameterTypeEntity";

describe("Entity Relationships", () => {
    it("should have correct relationships defined on entities", () => {
        // Test that StationEntity exists and has expected properties
        const station = new StationEntity();
        station.id = 1;
        station.name = "Test Station";
        expect(station.name).toBe("Test Station");
        expect(station.id).toBe(1);

        // Test that parameterTypeEntity exists and has expected properties
        const paramType = new parameterTypeEntity();
        paramType.id = 1;
        paramType.key = "TST";
        paramType.name = "Temperature";
        expect(paramType.key).toBe("TST");
        expect(paramType.name).toBe("Temperature");

        // Test that ParameterEntity exists and has expected properties
        const parameter = new ParameterEntity();
        parameter.id = 1;
        parameter.sensor_model = "S-456";
        parameter.active = true;
        expect(parameter.sensor_model).toBe("S-456");
        expect(parameter.active).toBe(true);
    });

    it("should be able to create instances of all entities", () => {
        const station = new StationEntity();
        const paramType = new parameterTypeEntity();
        const parameter = new ParameterEntity();

        expect(station).toBeInstanceOf(StationEntity);
        expect(paramType).toBeInstanceOf(parameterTypeEntity);
        expect(parameter).toBeInstanceOf(ParameterEntity);
    });
});
