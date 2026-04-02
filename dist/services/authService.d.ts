interface LoginProps {
    email: string;
    password: string;
}
export declare class AuthService {
    login({ email, password }: LoginProps): Promise<string>;
}
export {};
//# sourceMappingURL=authService.d.ts.map