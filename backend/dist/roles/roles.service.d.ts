import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { AuditService } from '../audit/audit.service';
export declare class RolesService {
    private rolesRepository;
    private permissionsRepository;
    private auditService;
    constructor(rolesRepository: Repository<Role>, permissionsRepository: Repository<Permission>, auditService: AuditService);
    create(createRoleDto: CreateRoleDto, currentUserId: string): Promise<Role>;
    findAll(): Promise<Role[]>;
    findOne(id: string): Promise<Role>;
    update(id: string, updateRoleDto: UpdateRoleDto, currentUserId: string): Promise<Role>;
    remove(id: string, currentUserId: string): Promise<{
        message: string;
    }>;
    attachPermissions(id: string, permissionIds: string[], currentUserId: string): Promise<Role>;
    detachPermission(id: string, permissionId: string, currentUserId: string): Promise<Role>;
}
