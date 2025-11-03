import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';
export declare class UsersService {
    private usersRepository;
    private rolesRepository;
    private auditService;
    constructor(usersRepository: Repository<User>, rolesRepository: Repository<Role>, auditService: AuditService);
    create(createUserDto: CreateUserDto, currentUserId: string): Promise<User>;
    findAll(query: QueryUsersDto): Promise<{
        data: User[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, currentUserId: string): Promise<User>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string, currentUserId: string): Promise<User>;
    assignRoles(id: string, roleIds: string[], currentUserId: string): Promise<User>;
}
