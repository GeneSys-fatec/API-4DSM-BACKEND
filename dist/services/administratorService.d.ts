export default interface CreateAdministratorProps {
    name: string;
    email: string;
    password: string;
}
interface UpdateAdministratorProps {
    id: number;
    newEmail?: string;
    newName?: string;
    newPassword?: string;
}
interface DeleteAdministratorProps {
    id: number;
}
export declare class AdministratorService {
    create({ name, email, password }: CreateAdministratorProps): Promise<import("../entities/administratorEntity.js").administratorEntity>;
    list(): Promise<import("../entities/administratorEntity.js").administratorEntity[]>;
    update({ id, newEmail, newName, newPassword }: UpdateAdministratorProps): Promise<{
        message: string;
    }>;
    delete({ id }: DeleteAdministratorProps): Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=administratorService.d.ts.map