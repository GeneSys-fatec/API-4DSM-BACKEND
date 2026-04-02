import bcrypt from "bcrypt";
import { administratorRepository } from "../repositories/administratorRepository.js";
;
export class AdministratorService {
    async create({ name, email, password }) {
        if (!name || !email || !password) {
            throw new Error("Preencha todos os campos!");
        }
        ;
        const isEmailRegistered = await administratorRepository.findOne({ where: { email } });
        if (isEmailRegistered) {
            throw new Error("E-mail já cadastrado.");
        }
        ;
        const hashedPassword = await bcrypt.hash(password, 10);
        const administrator = await administratorRepository.create({
            name,
            email,
            password: hashedPassword
        });
        await administratorRepository.save(administrator);
        return administrator;
    }
    ;
    async list() {
        const administrators = await administratorRepository.find();
        return administrators;
    }
    async update({ id, newEmail, newName, newPassword }) {
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
    async delete({ id }) {
        if (!id) {
            throw new Error("Insira o id do administrador que deseja excluir!");
        }
        const administrator = await administratorRepository.delete(id);
        if (administrator.affected == 0) {
            throw new Error("Usuário não encontrado, tente novamente");
        }
        return { message: "Cliente removido!" };
    }
}
;
//# sourceMappingURL=administratorService.js.map