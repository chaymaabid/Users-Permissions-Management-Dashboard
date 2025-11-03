import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AttachPermissionsDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @RequirePermissions('role.manage')
  create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user: any) {
    return this.rolesService.create(createRoleDto, user.id);
  }

  @Get()
  @RequirePermissions('role.read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('role.read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('role.manage')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: any,
  ) {
    return this.rolesService.update(id, updateRoleDto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('role.manage')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolesService.remove(id, user.id);
  }

  @Post(':id/permissions')
  @RequirePermissions('role.manage')
  attachPermissions(
    @Param('id') id: string,
    @Body() dto: AttachPermissionsDto,
    @CurrentUser() user: any,
  ) {
    return this.rolesService.attachPermissions(id, dto.permissionIds, user.id);
  }

  @Delete(':id/permissions/:permissionId')
  @RequirePermissions('role.manage')
  detachPermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
    @CurrentUser() user: any,
  ) {
    return this.rolesService.detachPermission(id, permissionId, user.id);
  }
}