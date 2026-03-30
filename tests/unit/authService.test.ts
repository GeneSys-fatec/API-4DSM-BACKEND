import { describe, it, expect, vi, beforeEach } from "vitest";

const repositoryMock = vi.hoisted(() => ({
    findOne: vi.fn(),
}));

vi.mock("../../src/repositories/administratorRepository.js", () => ({
    administratorRepository: repositoryMock,
}));

vi.mock("bcrypt", () => ({
    default: {
        hash: vi.fn().mockResolvedValue("hashed_password"),
        compare: vi.fn(),
    },
}));

vi.mock("jose", () => {
    const encryptInstance = {
        setProtectedHeader: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        encrypt: vi.fn().mockResolvedValue("mocked_token"),
    };
    return {
        EncryptJWT: function () {
            return encryptInstance;
        },
    };
});

describe("AuthService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("deve lançar erro quando campos obrigatórios não são preenchidos", async () => {
        const { AuthService } = await import("../../src/services/authService.js");
        const service = new AuthService();

        // Arrange
        const dadosInvalidos = { email: "", password: "" };

        // Act
        const resultado = service.login(dadosInvalidos);

        // Assert
        await expect(resultado).rejects.toThrow("Preencha todos os campos!");
    });

    it("deve lançar erro quando e-mail não está cadastrado", async () => {
        const { AuthService } = await import("../../src/services/authService.js");
        const service = new AuthService();

        // Arrange
        repositoryMock.findOne.mockResolvedValueOnce(null);

        // Act
        const resultado = service.login({ email: "naoexiste@email.com", password: "123456" });

        // Assert
        await expect(resultado).rejects.toThrow("E-mail não cadastrado.");
    });

    it("deve lançar erro quando senha informada é incorreta", async () => {
        const { AuthService } = await import("../../src/services/authService.js");
        const service = new AuthService();
        const bcrypt = await import("bcrypt");

        // Arrange
        repositoryMock.findOne.mockResolvedValueOnce({ id: 1, email: "admin@admin.com", password: "hashed_password" });
        vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(false as never);

        // Act
        const resultado = service.login({ email: "admin@admin.com", password: "senha_errada" });

        // Assert
        await expect(resultado).rejects.toThrow("Senha incorreta.");
    });

    it("deve retornar token JWE quando credenciais são válidas", async () => {
        const { AuthService } = await import("../../src/services/authService.js");
        const service = new AuthService();
        const bcrypt = await import("bcrypt");

        // Arrange
        repositoryMock.findOne.mockResolvedValueOnce({ id: 1, email: "admin@admin.com", password: "hashed_password" });
        vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(true as never);

        // Act
        const resultado = await service.login({ email: "admin@admin.com", password: "123456" });

        // Assert
        expect(resultado).toBe("mocked_token");
    });
});