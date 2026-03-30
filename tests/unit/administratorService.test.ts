import { describe, it, expect, vi, beforeEach } from "vitest";

const repositoryMock = vi.hoisted(() => ({
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe("AdministratorService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // CREATE
    it("deve lançar erro quando campos obrigatórios não são preenchidos", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        const dadosInvalidos = { name: "", email: "", password: "" };

        // Act
        const resultado = service.create(dadosInvalidos);

        // Assert
        await expect(resultado).rejects.toThrow("Preencha todos os campos!");
    });

    it("deve lançar erro quando e-mail já está cadastrado", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        repositoryMock.findOne.mockResolvedValueOnce({ id: 1, email: "admin@admin.com" });

        // Act
        const resultado = service.create({ name: "Admin", email: "admin@admin.com", password: "123456" });

        // Assert
        await expect(resultado).rejects.toThrow("E-mail já cadastrado.");
    });

    it("deve criar administrador com senha criptografada quando dados são válidos", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        const administradorMock = { name: "Admin", email: "admin@admin.com", password: "hashed_password" };
        repositoryMock.findOne.mockResolvedValueOnce(null);
        repositoryMock.create.mockReturnValueOnce(administradorMock);
        repositoryMock.save.mockResolvedValueOnce(administradorMock);

        // Act
        const resultado = await service.create({ name: "Admin", email: "admin@admin.com", password: "123456" });

        // Assert
        expect(repositoryMock.create).toHaveBeenCalledWith({
            name: "Admin",
            email: "admin@admin.com",
            password: "hashed_password",
        });
        expect(resultado).toEqual(administradorMock);
    });

    // LIST
    it("deve retornar todos os administradores cadastrados", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        const administradoresMock = [
            { id: 1, name: "Admin 1" },
            { id: 2, name: "Admin 2" },
        ];
        repositoryMock.find.mockResolvedValueOnce(administradoresMock);

        // Act
        const resultado = await service.list();

        // Assert
        expect(repositoryMock.find).toHaveBeenCalled();
        expect(resultado).toHaveLength(2);
        expect(resultado).toEqual(administradoresMock);
    });

    // UPDATE
    it("deve lançar erro quando id não é fornecido para atualização", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        const dadosSemId = { id: 0 };

        // Act
        const resultado = service.update(dadosSemId);

        // Assert
        await expect(resultado).rejects.toThrow("O id é necessário para localizar o cliente.");
    });

    it("deve lançar erro quando administrador não é encontrado para atualização", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        repositoryMock.update.mockResolvedValueOnce({ affected: 0 });

        // Act
        const resultado = service.update({ id: 999, newName: "Novo Nome" });

        // Assert
        await expect(resultado).rejects.toThrow("Administrador não encontrado para atualização.");
    });

    it("deve atualizar apenas os campos enviados quando dados são válidos", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        repositoryMock.update.mockResolvedValueOnce({ affected: 1 });

        // Act
        const resultado = await service.update({ id: 1, newName: "Nome Atualizado" });

        // Assert
        expect(repositoryMock.update).toHaveBeenCalledWith({ id: 1 }, { name: "Nome Atualizado" });
        expect(resultado).toEqual({ message: "Administrador atualizado com sucesso!" });
    });

    // DELETE
    it("deve lançar erro quando id não é fornecido para exclusão", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        const dadosSemId = { id: 0 };

        // Act
        const resultado = service.delete(dadosSemId);

        // Assert
        await expect(resultado).rejects.toThrow("Insira o id do administrador que deseja excluir!");
    });

    it("deve lançar erro quando administrador não é encontrado para exclusão", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        repositoryMock.delete.mockResolvedValueOnce({ affected: 0 });

        // Act
        const resultado = service.delete({ id: 999 });

        // Assert
        await expect(resultado).rejects.toThrow("Usuário não encontrado, tente novamente");
    });

    it("deve remover administrador e retornar mensagem de sucesso quando id é válido", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        // Arrange
        repositoryMock.delete.mockResolvedValueOnce({ affected: 1 });

        // Act
        const resultado = await service.delete({ id: 1 });

        // Assert
        expect(repositoryMock.delete).toHaveBeenCalledWith(1);
        expect(resultado).toEqual({ message: "Cliente removido!" });
    });
});