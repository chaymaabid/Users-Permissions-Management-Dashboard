import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';
export declare class Role {
    id: string;
    name: string;
    description: string;
    users: User[];
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}
