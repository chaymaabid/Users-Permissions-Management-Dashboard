import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private auditService: AuditService,
  ) {}


  async create(createRoleDto: CreateRoleDto, currentUserId: string) {
    const { name, description, permissionIds } = createRoleDto;

    const existing = await this.rolesRepository.findOne({ where: { name } });
    if (existing) {
      throw new BadRequestException('Role already exists');
    }

    let permissions: Permission[] = [];
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

  async findOne(id: string) {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, currentUserId: string) {
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

  async remove(id: string, currentUserId: string) {
    const role = await this.findOne(id);

    if (role.users && role.users.length > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
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

  async attachPermissions(id: string, permissionIds: string[], currentUserId: string) {
    const role = await this.findOne(id);
    const permissions = await this.permissionsRepository.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
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

  async detachPermission(id: string, permissionId: string, currentUserId: string) {
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
}