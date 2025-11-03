import { Role } from '../../roles/entities/role.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    refreshToken: string;
    resetPasswordToken: string;
    emailVerificationToken: string;
    isEmailVerified: boolean;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}
