export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleIds?: string[];
}
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    isActive?: boolean;
    roleIds?: string[];
}
export declare class QueryUsersDto {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class AssignRolesDto {
    roleIds: string[];
}
