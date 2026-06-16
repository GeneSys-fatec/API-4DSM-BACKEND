import { describe, expect, it } from "vitest";
import { parseOptionalBoolean, parseOptionalDate, parseOptionalNumber } from "../../src/utils/filterParser.js";

describe("filterParser", () => {
    describe("parseOptionalNumber", () => {
        it("deve retornar undefined para valores vazios ou undefined", () => {
            expect(parseOptionalNumber(undefined)).toBeUndefined();
            expect(parseOptionalNumber(null)).toBeUndefined();
            expect(parseOptionalNumber("")).toBeUndefined();
        });

        it("deve retornar undefined para valores não numéricos", () => {
            expect(parseOptionalNumber("abc")).toBeUndefined();
            expect(parseOptionalNumber("12abc")).toBeUndefined();
        });

        it("deve converter strings numéricas para number", () => {
            expect(parseOptionalNumber("123")).toBe(123);
            expect(parseOptionalNumber("12.34")).toBe(12.34);
            expect(parseOptionalNumber("-5")).toBe(-5);
        });

        it("deve manter o tipo number se já for number", () => {
            expect(parseOptionalNumber(42)).toBe(42);
            expect(parseOptionalNumber(0)).toBe(0);
        });
    });

    describe("parseOptionalBoolean", () => {
        it("deve retornar undefined para valores vazios ou undefined", () => {
            expect(parseOptionalBoolean(undefined)).toBeUndefined();
            expect(parseOptionalBoolean(null)).toBeUndefined();
            expect(parseOptionalBoolean("")).toBeUndefined();
        });

        it("deve retornar o próprio valor se já for boolean", () => {
            expect(parseOptionalBoolean(true)).toBe(true);
            expect(parseOptionalBoolean(false)).toBe(false);
        });

        it("deve converter strings 'true' e '1' para true", () => {
            expect(parseOptionalBoolean("true")).toBe(true);
            expect(parseOptionalBoolean(" TRUE ")).toBe(true);
            expect(parseOptionalBoolean("1")).toBe(true);
        });

        it("deve converter strings 'false' e '0' para false", () => {
            expect(parseOptionalBoolean("false")).toBe(false);
            expect(parseOptionalBoolean(" FALSE ")).toBe(false);
            expect(parseOptionalBoolean("0")).toBe(false);
        });

        it("deve retornar undefined para strings não booleanas", () => {
            expect(parseOptionalBoolean("sim")).toBeUndefined();
            expect(parseOptionalBoolean("abc")).toBeUndefined();
        });
    });

    describe("parseOptionalDate", () => {
        it("deve retornar undefined para valores inválidos ou vazios", () => {
            expect(parseOptionalDate(undefined)).toBeUndefined();
            expect(parseOptionalDate(null)).toBeUndefined();
            expect(parseOptionalDate("")).toBeUndefined();
            expect(parseOptionalDate("   ")).toBeUndefined();
            expect(parseOptionalDate("data-invalida")).toBeUndefined();
        });

        it("deve converter string de data válida", () => {
            const date = parseOptionalDate("2026-03-28T10:00:00.000Z");
            expect(date).toBeInstanceOf(Date);
            expect(date?.toISOString()).toBe("2026-03-28T10:00:00.000Z");
        });

        it("deve ajustar para o final do dia se a opção endOfDay for passada em datas curtas", () => {
            const date = parseOptionalDate("2026-03-28", { endOfDay: true });
            expect(date).toBeInstanceOf(Date);
            // Dependendo do fuso horário local onde os testes rodam, getHours retornará o horário final do dia no fuso local.
            // Para garantir que a função seja validada sem problemas de fuso horário, verificamos os componentes de hora.
            expect(date?.getHours()).toBe(23);
            expect(date?.getMinutes()).toBe(59);
            expect(date?.getSeconds()).toBe(59);
            expect(date?.getMilliseconds()).toBe(999);
        });

        it("não deve ajustar endOfDay se a data já contém informações de horário", () => {
            const date = parseOptionalDate("2026-03-28T10:00:00.000Z", { endOfDay: true });
            expect(date).toBeInstanceOf(Date);
            // Como passamos um horário completo e não o formato exato YYYY-MM-DD, a Regex falha, mantendo o horário original
            expect(date?.toISOString()).toBe("2026-03-28T10:00:00.000Z");
        });
    });
});
