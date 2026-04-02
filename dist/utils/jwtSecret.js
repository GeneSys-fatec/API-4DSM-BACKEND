import { createHash } from "node:crypto";
export function getJwtEncryptionKey() {
    const rawSecret = process.env.JWT_TOKEN;
    if (!rawSecret) {
        throw new Error("JWT_TOKEN não configurado no ambiente.");
    }
    // Deriva uma chave estável de 32 bytes para A256GCM.
    return createHash("sha256").update(rawSecret, "utf8").digest();
}
//# sourceMappingURL=jwtSecret.js.map