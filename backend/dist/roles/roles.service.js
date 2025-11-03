"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const audit_service_1 = require("../audit/audit.service");
let RolesService = class RolesService {
    rolesRepository;
    permissionsRepository;
    auditService;
    constructor(rolesRepository, permissionsRepository, auditService) {
        this.rolesRepository = rolesRepository;
        this.permissionsRepository = permissionsRepository;
        this.auditService = auditService;
    }
    async create(createRoleDto, currentUserId) {
        const { name, description, permissionIds } = createRoleDto;
        const existing = await this.rolesRepository.findOne({ where: { name } });
        if (existing) {
            throw new common_1.BadRequestException('Role already exists');
        }
        let permissions = [];
        if (permissionIds && permissionIds.length > 0) {
            permissions = await this.permissionsRepository.findByIds(permissionIds);
        }
        const role = this.rolesRepository.create({
            name,
            description,
            permissions,
        });
        const saved = await this.rolesRepository.save(role);
        await this.auditService.log({
            userId: currentUserId,
            action: 'role.created',
            entityType: 'Role',
            entityId: saved.id,
            changes: { name, description, permissionIds },
        });
        return saved;
    }
    async findAll() {
        return this.rolesRepository.find({
            relations: ['permissions'],
        });
    }
    async findOne(id) {
        const role = await this.rolesRepository.findOne({
            where: { id },
            relations: ['permissions', 'users'],
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async update(id, updateRoleDto, currentUserId) {
        const role = await this.findOne(id);
        const { permissionIds, ...updateData } = updateRoleDto;
        if (permissionIds) {
            role.permissions = await this.permissionsRepository.findByIds(permissionIds);
        }
        Object.assign(role, updateData);
        const updated = await this.rolesRepository.save(role);
        await this.auditService.log({
            userId: currentUserId,
            action: 'role.updated',
            entityType: 'Role',
            entityId: id,
            changes: updateRoleDto,
        });
        return updated;
    }
    async remove(id, currentUserId) {
        const role = await this.findOne(id);
        if (role.users && role.users.length > 0) {
            throw new common_1.BadRequestException('Cannot delete role that is assigned to users');
        }
        await this.rolesRepository.remove(role);
        await this.auditService.log({
            userId: currentUserId,
            action: 'role.deleted',
            entityType: 'Role',
            entityId: id,
            changes: { name: role.name },
        });
        return { message: 'Role deleted successfully' };
    }
    async attachPermissions(id, permissionIds, currentUserId) {
        const role = await this.findOne(id);
        const permissions = await this.permissionsRepository.findByIds(permissionIds);
        if (permissions.length !== permissionIds.length) {
            throw new common_1.BadRequestException('Some permissions not found');
        }
        const existingIds = role.permissions.map(p => p.id);
        const newPermissions = permissions.filter(p => !existingIds.includes(p.id));
        role.permissions = [...role.permissions, ...newPermissions];
        const updated = await this.rolesRepository.save(role);
        await this.auditService.log({
            userId: currentUserId,
            action: 'role.permissions.attached',
            entityType: 'Role',
            entityId: id,
            changes: { permissionIds },
        });
        return updated;
    }
    async detachPermission(id, permissionId, currentUserId) {
        const role = await this.findOne(id);
        role.permissions = role.permissions.filter(p => p.id !== permissionId);
        const updated = await this.rolesRepository.save(role);
        await this.auditService.log({
            userId: currentUserId,
            action: 'role.permission.detached',
            entityType: 'Role',
            entityId: id,
            changes: { permissionId },
        });
        return updated;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map