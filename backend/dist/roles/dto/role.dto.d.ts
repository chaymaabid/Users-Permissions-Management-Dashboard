export declare class CreateRoleDto {
    name: string;
    description?: string;
    permissionIds?: string[];
}
export declare class UpdateRoleDto {
    name?: string;
    description?: string;
    permissionIds?: string[];
}
export declare class AttachPermissionsDto {
    permissionIds: string[];
}
