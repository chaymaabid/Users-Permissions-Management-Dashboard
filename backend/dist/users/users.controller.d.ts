import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUsersDto, AssignRolesDto } from './dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, user: any): Promise<import("./entities/user.entity").User>;
    findAll(query: QueryUsersDto): Promise<{
        data: import("./entities/user.entity").User[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<import("./entities/user.entity").User>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<import("./entities/user.entity").User>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    toggleActive(id: string, user: any): Promise<import("./entities/user.entity").User>;
    assignRoles(id: string, assignRolesDto: AssignRolesDto, user: any): Promise<import("./entities/user.entity").User>;
}
