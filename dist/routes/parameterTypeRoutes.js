import { z } from "zod";
import { parameterTypeController } from "../controllers/parameterTypeController.js";
const parameterTypeIdSchema = z.object({
    id: z.string().describe("ID do tipo de parâmetro"),
});
const numericInputSchema = z.preprocess((value) => {
    if (typeof value === "string") {
        return Number(value.replace(",", "."));
    }
    return value;
}, z.number());
const parameterTypeCreateBodySchema = z.object({
    json_key: z.string().trim().min(1).max(30),
    name: z.string(),
    unit: z.string(),
    factor: numericInputSchema,
    offset: numericInputSchema,
    description: z.string().optional(),
});
const parameterTypeUpdateBodySchema = parameterTypeCreateBodySchema.partial();
export async function parameterTypeRoutes(fastify, _options) {
    fastify.get("/", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Listagem de tipos de parâmetro",
        },
        handler: parameterTypeController.list,
    });
    fastify.get("/:id", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Localize tipos de parâmetro pelo id",
            params: parameterTypeIdSchema,
        },
        handler: parameterTypeController.findById,
    });
    fastify.post("/create", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Crie um novo tipo de parâmetro",
            body: parameterTypeCreateBodySchema,
        },
        handler: parameterTypeController.create,
    });
    fastify.put("/update/:id", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Atualize um tipo de parâmetro pelo id",
            params: parameterTypeIdSchema,
            body: parameterTypeUpdateBodySchema,
        },
        handler: parameterTypeController.update,
    });
    fastify.delete("/delete/:id", {
        schema: {
            tags: ["tipos de parâmetro"],
            summary: "Delete um tipo de parâmetro pelo id",
            params: parameterTypeIdSchema,
        },
        handler: parameterTypeController.delete,
    });
}
//# sourceMappingURL=parameterTypeRoutes.js.map