import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AttachPermissionsDto } from './dto/role.dto';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto, user: any): Promise<import("./entities/role.entity").Role>;
    findAll(): Promise<import("./entities/role.entity").Role[]>;
    findOne(id: string): Promise<import("./entities/role.entity").Role>;
    update(id: string, updateRoleDto: UpdateRoleDto, user: any): Promise<import("./entities/role.entity").Role>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    attachPermissions(id: string, dto: AttachPermissionsDto, user: any): Promise<import("./entities/role.entity").Role>;
    detachPermission(id: string, permissionId: string, user: any): Promise<import("./entities/role.entity").Role>;
}
