import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source.js";
import { administratorEntity } from "../entities/administratorEntity.js";
export async function seedAdministrator() {
    const administratorRepository = AppDataSource.getRepository(administratorEntity);
    const existing = await administratorRepository.findOne({ where: { email: "admin@admin.com" } });
    if (existing) {
        console.log("Administrador já existe, seed ignorado.");
        return;
    }
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const administrator = administratorRepository.create({
        name: "Administrador",
        email: "admin@admin.com",
        password: hashedPassword,
    });
    await administratorRepository.save(administrator);
}
//# sourceMappingURL=administratorSeed.js.map