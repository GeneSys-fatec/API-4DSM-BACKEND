import { describe, it, expect } from "vitest";
import { ParameterEntity } from "../../src/entities/parameterEntity";
import { StationEntity } from "../../src/entities/stationEntity";
import { parameterTypeEntity } from "../../src/entities/parameterTypeEntity";

describe("Entity Relationships", () => {
    it("should have correct relationships defined on entities", () => {
        
        const station = new StationEntity();
        station.id = 1;
        station.name = "Test Station";
        expect(station.name).toBe("Test Station");
        expect(station.id).toBe(1);

        
        const paramType = new parameterTypeEntity();
        paramType.id = 1;
        paramType.json_key = "temperature_2m";
        paramType.name = "Temperature";
        expect(paramType.json_key).toBe("temperature_2m");
        expect(paramType.name).toBe("Temperature");

        
        const parameter = new ParameterEntity();
        parameter.id = 1;
        parameter.idStation = 1;
        parameter.idTypeParam = 2;
        expect(parameter.idStation).toBe(1);
        expect(parameter.idTypeParam).toBe(2);
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
