import { describe, it, expect, vi, beforeEach } from "vitest";

const serviceMock = vi.hoisted(() => ({
    login: vi.fn(),
}));

vi.mock("../../src/services/authService.js", () => ({
    AuthService: function () {
        return serviceMock;
    },
}));

const replyMock = {
    send: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
};

describe("AuthController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        replyMock.send.mockReturnThis();
        replyMock.status.mockReturnThis();
    });

    it("deve retornar token quando credenciais são válidas", async () => {
        const { AuthController } = await import("../../src/controllers/authController.js");
        const controller = new AuthController();

        // Arrange
        const requestMock = {
            body: { email: "admin@admin.com", password: "123456" },
        } as any;
        serviceMock.login.mockResolvedValueOnce("mocked_token");

        // Act
        const resultado = await controller.login(requestMock, replyMock as any);

        // Assert
        expect(serviceMock.login).toHaveBeenCalledWith({ email: "admin@admin.com", password: "123456" });
        expect(resultado).toBe("mocked_token");
    });

    it("deve retornar status 400 quando campos obrigatórios não são preenchidos", async () => {
        const { AuthController } = await import("../../src/controllers/authController.js");
        const controller = new AuthController();

        // Arrange
        const requestMock = {
            body: { email: "", password: "" },
        } as any;
        serviceMock.login.mockRejectedValueOnce(new Error("Preencha todos os campos!"));

        // Act
        await controller.login(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Preencha todos os campos!" });
    });

    it("deve retornar status 400 quando e-mail não está cadastrado", async () => {
        const { AuthController } = await import("../../src/controllers/authController.js");
        const controller = new AuthController();

        // Arrange
        const requestMock = {
            body: { email: "naoexiste@email.com", password: "123456" },
        } as any;
        serviceMock.login.mockRejectedValueOnce(new Error("E-mail não cadastrado."));

        // Act
        await controller.login(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "E-mail não cadastrado." });
    });

    it("deve retornar status 400 quando senha informada é incorreta", async () => {
        const { AuthController } = await import("../../src/controllers/authController.js");
        const controller = new AuthController();

        // Arrange
        const requestMock = {
            body: { email: "admin@admin.com", password: "senha_errada" },
        } as any;
        serviceMock.login.mockRejectedValueOnce(new Error("Senha incorreta."));

        // Act
        await controller.login(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Senha incorreta." });
    });

    it("deve retornar status 200 no logout", async () => {
        const { AuthController } = await import("../../src/controllers/authController.js");
        const controller = new AuthController();

        await controller.logout({} as any, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(200);
        expect(replyMock.send).toHaveBeenCalledWith({ message: "Logout realizado com sucesso." });
    });
});