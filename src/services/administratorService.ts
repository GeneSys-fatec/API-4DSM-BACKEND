import bcrypt from "bcrypt";
import { administratorRepository } from "../repositories/administratorRepository.js";
import { Brackets } from "typeorm";
import { normalizeSearchTerm, unaccentedSql } from "../utils/textSearch.js";

export default interface CreateAdministratorProps {
    name: string,
    email: string,
    password: string
};

interface UpdateAdministratorProps {
    id: number;
    newEmail?: string | undefined;
    newName?: string | undefined;
    newPassword?: string | undefined;
}

interface DeleteAdministratorProps {
    id: number
}

export interface AdministratorListFilters {
    q?: string;
    status?: boolean;
    from?: Date;
    to?: Date;
}

export class AdministratorService {
    async create({ name, email, password }: CreateAdministratorProps) {
        if (!name || !email || !password) {
            throw new Error("Preencha todos os campos!")
        };
        const isEmailRegistered = await administratorRepository.findOne({ where: { email } });

        if (isEmailRegistered) {
            throw new Error("E-mail já cadastrado.")
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const administrator = await administratorRepository.create({
            name,
            email,
            password: hashedPassword
        });

        await administratorRepository.save(administrator);

        return administrator
    };

    async list(filters: AdministratorListFilters = {}) {
        const searchTerm = normalizeSearchTerm(filters.q ?? "");

        const hasFilters = Boolean(
            searchTerm ||
            filters.from ||
            filters.to ||
            filters.status !== undefined,
        );

        if (!hasFilters) {
            const administrators = await administratorRepository.find();

            return administrators;
        }

        const queryBuilder = administratorRepository
            .createQueryBuilder("administrator")
            .orderBy("administrator.id", "ASC");

        if (searchTerm) {
            const term = `%${searchTerm}%`;
            queryBuilder.andWhere(
                new Brackets((qb) => {
                    qb.where(`${unaccentedSql("administrator.name")} LIKE :term`, { term })
                        .orWhere(`${unaccentedSql("administrator.email")} LIKE :term`, { term })
                        .orWhere("CAST(administrator.id AS TEXT) LIKE :term", { term });
                }),
            );
        }

        if (filters.status !== undefined) {
            queryBuilder.andWhere("administrator.status = :status", {
                status: filters.status,
            });
        }

        if (filters.from) {
            queryBuilder.andWhere("administrator.createdAt >= :from", {
                from: filters.from,
            });
        }

        if (filters.to) {
            queryBuilder.andWhere("administrator.createdAt <= :to", {
                to: filters.to,
            });
        }

        const administrators = await queryBuilder.getMany();

        return administrators;
    }

    async listById(id: number) {
        if (!id) {
            throw new Error("O ID é necessário para a busca.");
        }

        const administrator = await administratorRepository.findOne({ where: { id } });

        if (!administrator) {
            throw new Error("Administrador não encontrado.");
        }

        return administrator;
    }

    async update({ id, newEmail, newName, newPassword }: UpdateAdministratorProps) {
        if (!id) {
            throw new Error("O id é necessário para localizar o cliente.");
        }

        const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : undefined;

        const result = await administratorRepository.update({ id }, {
            ...(newName && { name: newName }),
            ...(newEmail && { email: newEmail }),
            ...(hashedPassword && { password: hashedPassword }),
        });

        if (result.affected === 0) {
            throw new Error("Administrador não encontrado para atualização.");
        }

        return { message: "Administrador atualizado com sucesso!" };
    }

    async delete({ id }: DeleteAdministratorProps) {
        if (!id) {
            throw new Error("Insira o id do administrador que deseja excluir!")
        }

        const administrator = await administratorRepository.delete(id);

        if (administrator.affected == 0) {
            throw new Error("Usuário não encontrado, tente novamente")
        }

        return { message: "Cliente removido!" }
    }

};