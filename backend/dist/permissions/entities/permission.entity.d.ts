import { Role } from '../../roles/entities/role.entity';
export declare class Permission {
    id: string;
    action: string;
    description: string;
    roles: Role[];
}
