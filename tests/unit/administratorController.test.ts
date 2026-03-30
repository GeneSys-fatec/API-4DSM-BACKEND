import { describe, it, expect, vi, beforeEach } from "vitest";

const serviceMock = vi.hoisted(() => ({
    create: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("../../src/services/administratorService.js", () => ({
    AdministratorService: function () {
        return serviceMock;
    },
}));

const replyMock = {
    send: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
};

describe("AdministratorController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        replyMock.send.mockReturnThis();
        replyMock.status.mockReturnThis();
    });

    // CREATE
    it("deve retornar o administrador criado quando dados são válidos", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {
            body: { name: "Admin", email: "admin@admin.com", password: "123456" },
        } as any;
        const administradorCriado = { id: 1, name: "Admin", email: "admin@admin.com" };
        serviceMock.create.mockResolvedValueOnce(administradorCriado);

        // Act
        await controller.create(requestMock, replyMock as any);

        // Assert
        expect(serviceMock.create).toHaveBeenCalledWith({ name: "Admin", email: "admin@admin.com", password: "123456" });
        expect(replyMock.send).toHaveBeenCalledWith(administradorCriado);
    });

    it("deve retornar status 400 quando criação falha por erro de validação", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {
            body: { name: "", email: "", password: "" },
        } as any;
        serviceMock.create.mockRejectedValueOnce(new Error("Preencha todos os campos!"));

        // Act
        await controller.create(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Preencha todos os campos!" });
    });

    // LIST
    it("deve retornar lista de administradores cadastrados", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {} as any;
        const listaAdministradores = [
            { id: 1, name: "Admin 1" },
            { id: 2, name: "Admin 2" },
        ];
        serviceMock.list.mockResolvedValueOnce(listaAdministradores);

        // Act
        await controller.list(requestMock, replyMock as any);

        // Assert
        expect(serviceMock.list).toHaveBeenCalled();
        expect(replyMock.send).toHaveBeenCalledWith(listaAdministradores);
    });

    // UPDATE
    it("deve retornar mensagem de sucesso quando atualização é realizada", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {
            body: { id: 1, newName: "Nome Atualizado", newEmail: "novo@email.com", newPassword: "novaSenha" },
        } as any;
        const respostaAtualizar = { message: "Administrador atualizado com sucesso!" };
        serviceMock.update.mockResolvedValueOnce(respostaAtualizar);

        // Act
        await controller.update(requestMock, replyMock as any);

        // Assert
        expect(serviceMock.update).toHaveBeenCalledWith({ id: 1, newName: "Nome Atualizado", newEmail: "novo@email.com", newPassword: "novaSenha" });
        expect(replyMock.send).toHaveBeenCalledWith(respostaAtualizar);
    });

    it("deve retornar status 400 quando atualização falha por administrador não encontrado", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {
            body: { id: 999, newName: "Nome", newEmail: "", newPassword: "" },
        } as any;
        serviceMock.update.mockRejectedValueOnce(new Error("Administrador não encontrado para atualização."));

        // Act
        await controller.update(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Administrador não encontrado para atualização." });
    });

    // DELETE
    it("deve retornar mensagem de sucesso quando exclusão é realizada", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {
            body: { id: 1 },
        } as any;
        const respostaDeletar = { message: "Cliente removido!" };
        serviceMock.delete.mockResolvedValueOnce(respostaDeletar);

        // Act
        await controller.delete(requestMock, replyMock as any);

        // Assert
        expect(serviceMock.delete).toHaveBeenCalledWith({ id: 1 });
        expect(replyMock.send).toHaveBeenCalledWith(respostaDeletar);
    });

    it("deve retornar status 400 quando exclusão falha por administrador não encontrado", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        // Arrange
        const requestMock = {
            body: { id: 999 },
        } as any;
        serviceMock.delete.mockRejectedValueOnce(new Error("Usuário não encontrado, tente novamente"));

        // Act
        await controller.delete(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Usuário não encontrado, tente novamente" });
    });
});
