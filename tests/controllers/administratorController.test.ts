import { describe, it, expect, vi, beforeEach } from "vitest";

const serviceMock = vi.hoisted(() => ({
    create: vi.fn(),
    list: vi.fn(),
    listById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}));

vi.mock("../../src/services/administratorService.js", () => ({
    AdministratorService: function () {
        return serviceMock;
    },
}));

vi.mock("bcrypt", () => ({
    default: {
        compare: vi.fn(),
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

    it("deve retornar administrador por id quando encontrado", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 1 },
        } as any;
        const administrador = { id: 1, name: "Admin", email: "admin@admin.com" };
        serviceMock.listById.mockResolvedValueOnce(administrador);

        await controller.listById(requestMock, replyMock as any);

        expect(serviceMock.listById).toHaveBeenCalledWith(1);
        expect(replyMock.send).toHaveBeenCalledWith(administrador);
    });

    it("deve retornar status 404 quando listById não encontrar administrador", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 999 },
        } as any;
        serviceMock.listById.mockRejectedValueOnce(new Error("Administrador não encontrado."));

        await controller.listById(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(404);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Administrador não encontrado." });
    });

    // UPDATE
    it("deve retornar mensagem de sucesso quando atualização é realizada", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 1 },
            user: { id: 1 },
            body: { newName: "Nome Atualizado", newEmail: "novo@email.com" },
        } as any;
        const respostaAtualizar = { message: "Administrador atualizado com sucesso!" };
        serviceMock.update.mockResolvedValueOnce(respostaAtualizar);

        // Act
        await controller.update(requestMock, replyMock as any);

        // Assert
        expect(serviceMock.update).toHaveBeenCalledWith({ id: 1, newName: "Nome Atualizado", newEmail: "novo@email.com" });
        expect(replyMock.send).toHaveBeenCalledWith(respostaAtualizar);
    });

    it("deve retornar status 400 quando atualização falha por administrador não encontrado", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 999 },
            user: { id: 999 },
            body: { newName: "Nome", newEmail: "", newPassword: "" },
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

        const requestMock = {
            params: { id: 1 },
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

        const requestMock = {
            params: { id: 999 },
        } as any;
        serviceMock.delete.mockRejectedValueOnce(new Error("Usuário não encontrado, tente novamente"));

        // Act
        await controller.delete(requestMock, replyMock as any);

        // Assert
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Usuário não encontrado, tente novamente" });
    });

    // BRANCH: error não é instância de Error no create
    it("deve retornar 'Unknown error' quando create lança objeto não-Error", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            body: { name: "Admin", email: "admin@admin.com", password: "123456" },
        } as any;
        serviceMock.create.mockRejectedValueOnce("string error");

        await controller.create(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Unknown error" });
    });

    // BRANCH: error não é instância de Error no listById
    it("deve retornar 'Unknown error' quando listById lança objeto não-Error", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 1 },
        } as any;
        serviceMock.listById.mockRejectedValueOnce(42);

        await controller.listById(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(404);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Unknown error" });
    });

    // BRANCH: error não é instância de Error no update
    it("deve retornar 'Unknown error' quando update lança objeto não-Error", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 1 },
            user: { id: 1 },
            body: { newName: "Novo" },
        } as any;
        serviceMock.update.mockRejectedValueOnce({ code: 500 });

        await controller.update(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Unknown error" });
    });

    // BRANCH: error não é instância de Error no delete
    it("deve retornar 'Unknown error' quando delete lança objeto não-Error", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 1 },
        } as any;
        serviceMock.delete.mockRejectedValueOnce(null);

        await controller.delete(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Unknown error" });
    });

    // BRANCH: list com filtros q, status, from e to
    it("deve passar filtros q, status, from e to para o service na listagem", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            query: { q: "admin", status: "true", from: "2026-01-01", to: "2026-12-31" },
        } as any;
        serviceMock.list.mockResolvedValueOnce([]);

        await controller.list(requestMock, replyMock as any);

        expect(serviceMock.list).toHaveBeenCalledWith(
            expect.objectContaining({
                q: "admin",
                status: true,
                from: expect.any(Date),
                to: expect.any(Date),
            }),
        );
        expect(replyMock.send).toHaveBeenCalledWith([]);
    });

    // BRANCH: list sem query (undefined)
    it("deve chamar list com objeto vazio quando query é undefined", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {} as any;
        serviceMock.list.mockResolvedValueOnce([]);

        await controller.list(requestMock, replyMock as any);

        expect(serviceMock.list).toHaveBeenCalledWith({});
        expect(replyMock.send).toHaveBeenCalledWith([]);
    });

    // BRANCH: list com apenas q (sem status, from, to)
    it("deve passar apenas o filtro q quando outros filtros não são fornecidos", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            query: { q: "busca" },
        } as any;
        serviceMock.list.mockResolvedValueOnce([{ id: 1 }]);

        await controller.list(requestMock, replyMock as any);

        expect(serviceMock.list).toHaveBeenCalledWith({ q: "busca" });
    });

    // GET ME
    it("deve retornar o administrador autenticado no getMe", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            user: { id: 10 },
        } as any;
        const adminMock = { id: 10, name: "Admin Autenticado", email: "me@teste.com" };
        serviceMock.listById.mockResolvedValueOnce(adminMock);

        await controller.getMe(requestMock, replyMock as any);

        expect(serviceMock.listById).toHaveBeenCalledWith(10);
        expect(replyMock.send).toHaveBeenCalledWith(adminMock);
    });

    it("deve retornar status 401 no getMe se o usuario nao estiver no request", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {} as any;

        await controller.getMe(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(401);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Não autenticado." });
    });

    // PROFILE UPDATE PASSWORD VALIDATION
    it("deve rejeitar atualizacao de senha propria se a senha atual nao for informada", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 5 },
            user: { id: 5 },
            body: { newPassword: "newpassword" },
        } as any;

        await controller.update(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "A senha atual é obrigatória para alteração de senha." });
    });

    it("deve rejeitar atualizacao de senha propria se a senha atual estiver incorreta", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();
        const bcrypt = await import("bcrypt");

        const requestMock = {
            params: { id: 5 },
            user: { id: 5 },
            body: { newPassword: "newpassword", currentPassword: "wrongpassword" },
        } as any;

        const adminMock = { id: 5, password: "hashed_wrong_password" };
        serviceMock.listById.mockResolvedValueOnce(adminMock);
        vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(false);

        await controller.update(requestMock, replyMock as any);

        expect(serviceMock.listById).toHaveBeenCalledWith(5);
        expect(bcrypt.default.compare).toHaveBeenCalledWith("wrongpassword", "hashed_wrong_password");
        expect(replyMock.status).toHaveBeenCalledWith(400);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Senha atual incorreta." });
    });

    it("deve permitir atualizacao de senha propria se a senha atual estiver correta", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();
        const bcrypt = await import("bcrypt");

        const requestMock = {
            params: { id: 5 },
            user: { id: 5 },
            body: { newPassword: "newpassword", currentPassword: "correctpassword" },
        } as any;

        const adminMock = { id: 5, password: "hashed_correct_password" };
        serviceMock.listById.mockResolvedValueOnce(adminMock);
        vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(true);
        serviceMock.update.mockResolvedValueOnce({ message: "Atualizado" });

        await controller.update(requestMock, replyMock as any);

        expect(serviceMock.listById).toHaveBeenCalledWith(5);
        expect(bcrypt.default.compare).toHaveBeenCalledWith("correctpassword", "hashed_correct_password");
        expect(serviceMock.update).toHaveBeenCalledWith({ id: 5, newPassword: "newpassword" });
        expect(replyMock.send).toHaveBeenCalledWith({ message: "Atualizado" });
    });

    // FORBIDDEN PROFILE UPDATE (EDITING ANOTHER ADMIN)
    it("deve retornar status 403 se o usuario tentar atualizar outro administrador", async () => {
        const { AdministratorController } = await import("../../src/controllers/administratorController.js");
        const controller = new AdministratorController();

        const requestMock = {
            params: { id: 2 },
            user: { id: 1 },
            body: { newName: "Nome Alterado" },
        } as any;

        await controller.update(requestMock, replyMock as any);

        expect(replyMock.status).toHaveBeenCalledWith(403);
        expect(replyMock.send).toHaveBeenCalledWith({ error: "Você só pode alterar o seu próprio perfil." });
    });
});