import { EncryptJWT } from "jose";
import { administratorRepository } from "../repositories/administratorRepository.js";
import bcrypt from "bcrypt";

interface LoginProps{
    email: string;
    password: string;
}

export class AuthService {
    async login({email, password}: LoginProps){
        if(!email || !password){
            throw new Error("Preencha todos os campos!");
        };

        const administrator = await administratorRepository.findOne({ where: { email } });

        if(!administrator){
            throw new Error("E-mail não cadastrado.")
        }

        const isCorrectPassword = await bcrypt.compare(password, administrator.password);

        if(!isCorrectPassword){
            throw new Error("Senha incorreta.");
        }

        const secret = new TextEncoder().encode(process.env.JWT_TOKEN as string);

        const token = await new EncryptJWT({id: administrator.id, email: administrator.email})
        .setProtectedHeader({ alg: "dir", enc: "A256GCM"})
        .setExpirationTime("1h")
        .setIssuedAt()
        .encrypt(secret);
        
        return token;
    };
}