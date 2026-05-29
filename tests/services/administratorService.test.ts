import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("typeorm", async (importOriginal) => {
    const actual = await importOriginal<typeof import("typeorm")>();
    return {
        ...actual,
        Brackets: class Brackets {
            constructor(cb: any) {
                cb({
                    where: vi.fn().mockReturnThis(),
                    orWhere: vi.fn().mockReturnThis(),
                    andWhere: vi.fn().mockReturnThis(),
                });
            }
        },
    };
});

const repositoryMock = vi.hoisted(() => ({
    find: vi.fn(),
    findOne: vi.fn(),
    createQueryBuilder: vi.fn(),
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

    it("deve aplicar filtros na listagem de administradores", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const queryBuilderMock = {
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([{ id: 3, name: "Filtrado" }]),
        };

        repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const resultado = await service.list({ q: "fil", status: true });

        expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("administrator");
        expect(queryBuilderMock.getMany).toHaveBeenCalledOnce();
        expect(resultado).toEqual([{ id: 3, name: "Filtrado" }]);
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

    it("deve atualizar a senha criptografada quando newPassword é fornecido", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        repositoryMock.update.mockResolvedValueOnce({ affected: 1 });

        const resultado = await service.update({ id: 1, newPassword: "senha_nova" });

        expect(repositoryMock.update).toHaveBeenCalledWith({ id: 1 }, { password: "hashed_password" });
        expect(resultado).toEqual({ message: "Administrador atualizado com sucesso!" });
    });

    it("deve atualizar apenas nome e email", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        repositoryMock.update.mockResolvedValueOnce({ affected: 1 });

        await service.update({ id: 1, newName: "Novo", newEmail: "email" });

        expect(repositoryMock.update).toHaveBeenCalledWith({ id: 1 }, { name: "Novo", email: "email" });
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

    // LIST BY ID
    it("deve retornar administrador quando listById encontra pelo id", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const adminMock = { id: 1, name: "Admin", email: "admin@admin.com" };
        repositoryMock.findOne.mockResolvedValueOnce(adminMock);

        const resultado = await service.listById(1);

        expect(repositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(resultado).toEqual(adminMock);
    });

    it("deve lançar erro quando listById não encontra administrador", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        repositoryMock.findOne.mockResolvedValueOnce(null);

        await expect(service.listById(999)).rejects.toThrow("Administrador não encontrado.");
    });

    it("deve lançar erro quando listById recebe id falsy", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        await expect(service.listById(0)).rejects.toThrow("O ID é necessário para a busca.");
    });

    // LIST com filtro from
    it("deve aplicar filtro from na listagem de administradores", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const queryBuilderMock = {
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
        };

        repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const from = new Date("2026-01-01");
        const resultado = await service.list({ from });

        expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("administrator");
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("administrator.createdAt >= :from", { from });
        expect(resultado).toEqual([]);
    });

    // LIST com filtro to
    it("deve aplicar filtro to na listagem de administradores", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const queryBuilderMock = {
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
        };

        repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const to = new Date("2026-12-31");
        const resultado = await service.list({ to });

        expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("administrator");
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("administrator.createdAt <= :to", { to });
        expect(resultado).toEqual([]);
    });

    // LIST com filtro from e to
    it("deve aplicar filtros from e to combinados na listagem", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const queryBuilderMock = {
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([{ id: 5 }]),
        };

        repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const from = new Date("2026-01-01");
        const to = new Date("2026-12-31");
        const resultado = await service.list({ from, to });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("administrator.createdAt >= :from", { from });
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("administrator.createdAt <= :to", { to });
        expect(resultado).toEqual([{ id: 5 }]);
    });

    // LIST com apenas searchTerm (q) sem status
    it("deve aplicar filtro de busca textual sem status", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const queryBuilderMock = {
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([{ id: 10 }]),
        };

        repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const resultado = await service.list({ q: "admin" });

        expect(repositoryMock.createQueryBuilder).toHaveBeenCalledWith("administrator");
        expect(queryBuilderMock.andWhere).toHaveBeenCalled();
        expect(resultado).toEqual([{ id: 10 }]);
    });

    // LIST com apenas status
    it("deve aplicar apenas filtro de status na listagem", async () => {
        const { AdministratorService } = await import("../../src/services/administratorService.js");
        const service = new AdministratorService();

        const queryBuilderMock = {
            orderBy: vi.fn().mockReturnThis(),
            andWhere: vi.fn().mockReturnThis(),
            getMany: vi.fn().mockResolvedValueOnce([]),
        };

        repositoryMock.createQueryBuilder.mockReturnValueOnce(queryBuilderMock);

        const resultado = await service.list({ status: false });

        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith("administrator.status = :status", { status: false });
        expect(resultado).toEqual([]);
    });
});