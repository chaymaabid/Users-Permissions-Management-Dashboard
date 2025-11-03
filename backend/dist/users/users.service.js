"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const audit_service_1 = require("../audit/audit.service");
let UsersService = class UsersService {
    usersRepository;
    rolesRepository;
    auditService;
    constructor(usersRepository, rolesRepository, auditService) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
        this.auditService = auditService;
    }
    async create(createUserDto, currentUserId) {
        const { email, password, firstName, lastName, roleIds } = createUserDto;
        const existing = await this.usersRepository.findOne({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let roles = [];
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
    async findAll(query) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
        const queryBuilder = this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .leftJoinAndSelect('role.permissions', 'permission');
        if (search) {
            queryBuilder.where('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
        }
        queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
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
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, updateUserDto, currentUserId) {
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
    async remove(id, currentUserId) {
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
    async toggleActive(id, currentUserId) {
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
    async assignRoles(id, roleIds, currentUserId) {
        const user = await this.findOne(id);
        const roles = await this.rolesRepository.findByIds(roleIds);
        if (roles.length !== roleIds.length) {
            throw new common_1.BadRequestException('Some roles not found');
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map