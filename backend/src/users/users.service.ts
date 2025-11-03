import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto/user.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private auditService: AuditService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUserId: string) {
    const { email, password, firstName, lastName, roleIds } = createUserDto;

    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let roles: Role[] = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.rolesRepository.findByIds(roleIds);
    }


    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roles,
    });

    const savedUser = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: currentUserId,
      action: 'user.created',
      entityType: 'User',
      entityId: savedUser.id,
      changes: { email, firstName, lastName },
    });

    return savedUser;
  }

  async findAll(query: QueryUsersDto) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission');

    if (search) {
      queryBuilder.where(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUserId: string) {
    const user = await this.findOne(id);

    const { roleIds, password, ...updateData } = updateUserDto;

    if (roleIds) {
      user.roles = await this.rolesRepository.findByIds(roleIds);
    }

    if (password) {
      updateData['password'] = await bcrypt.hash(password, 10);
    }

    Object.assign(user, updateData);

    const updated = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: currentUserId,
      action: 'user.updated',
      entityType: 'User',
      entityId: id,
      changes: updateUserDto,
    });

    return updated;
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);

    await this.auditService.log({
      userId: currentUserId,
      action: 'user.deleted',
      entityType: 'User',
      entityId: id,
      changes: { email: user.email },
    });

    return { message: 'User deleted successfully' };
  }


  async toggleActive(id: string, currentUserId: string) {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    const updated = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: currentUserId,
      action: user.isActive ? 'user.activated' : 'user.deactivated',
      entityType: 'User',
      entityId: id,
      changes: { isActive: user.isActive },
    });

    return updated;
  }

  async assignRoles(id: string, roleIds: string[], currentUserId: string) {
    const user = await this.findOne(id);
    const roles = await this.rolesRepository.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('Some roles not found');
    }

    user.roles = roles;
    const updated = await this.usersRepository.save(user);

    await this.auditService.log({
      userId: currentUserId,
      action: 'user.roles.assigned',
      entityType: 'User',
      entityId: id,
      changes: { roleIds },
    });

    return updated;
  }
}