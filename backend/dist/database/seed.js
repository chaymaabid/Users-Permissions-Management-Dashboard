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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const bcrypt = __importStar(require("bcrypt"));
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        console.log('🌱 Starting database seed...');
        const permissionsRepo = app.get('PermissionRepository');
        const rolesRepo = app.get('RoleRepository');
        const usersRepo = app.get('UserRepository');
        await usersRepo.query('DELETE FROM user_roles');
        await usersRepo.query('DELETE FROM role_permissions');
        await usersRepo.delete({});
        await rolesRepo.delete({});
        await permissionsRepo.delete({});
        console.log('Creating permissions...');
        const permissionsData = [
            { action: 'user.create', description: 'Create new users' },
            { action: 'user.read', description: 'View users' },
            { action: 'user.update', description: 'Update users' },
            { action: 'user.delete', description: 'Delete users' },
            { action: 'role.manage', description: 'Manage roles' },
            { action: 'role.read', description: 'View roles' },
            { action: 'role.assign', description: 'Assign roles to users' },
            { action: 'permission.read', description: 'View permissions' },
            { action: 'audit.read', description: 'View audit logs' },
        ];
        const permissions = await permissionsRepo.save(permissionsData);
        console.log(`✓ Created ${permissions.length} permissions`);
        const getPermissions = (actions) => permissions.filter(p => actions.includes(p.action));
        console.log('Creating roles...');
        const adminRole = await rolesRepo.save({
            name: 'Admin',
            description: 'Full system access',
            permissions: permissions,
        });
        const managerRole = await rolesRepo.save({
            name: 'Manager',
            description: 'Can manage users',
            permissions: getPermissions([
                'user.create',
                'user.read',
                'user.update',
                'role.read',
                'role.assign',
                'permission.read',
            ]),
        });
        const userRole = await rolesRepo.save({
            name: 'User',
            description: 'Basic user access',
            permissions: getPermissions(['user.read', 'role.read']),
        });
        const viewerRole = await rolesRepo.save({
            name: 'Viewer',
            description: 'Read-only access',
            permissions: getPermissions(['user.read', 'role.read', 'permission.read']),
        });
        console.log('✓ Created 4 roles');
        console.log('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await usersRepo.save({
            email: 'admin@example.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            isActive: true,
            isEmailVerified: true,
            roles: [adminRole],
        });
        await usersRepo.save({
            email: 'manager@example.com',
            password: hashedPassword,
            firstName: 'Manager',
            lastName: 'User',
            isActive: true,
            isEmailVerified: true,
            roles: [managerRole],
        });
        const regularUsers = [
            {
                email: 'john.doe@example.com',
                firstName: 'John',
                lastName: 'Doe',
                roles: [userRole],
            },
            {
                email: 'jane.smith@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                roles: [userRole],
            },
            {
                email: 'bob.viewer@example.com',
                firstName: 'Bob',
                lastName: 'Viewer',
                roles: [viewerRole],
            },
        ];
        for (const userData of regularUsers) {
            await usersRepo.save({
                ...userData,
                password: hashedPassword,
                isActive: true,
                isEmailVerified: true,
            });
        }
        console.log('✓ Created 5 users');
        console.log('\n✅ Seed completed successfully!');
        console.log('\n📋 Test Accounts:');
        console.log('Admin: admin@example.com / password123');
        console.log('Manager: manager@example.com / password123');
        console.log('User: john.doe@example.com / password123');
        console.log('User: jane.smith@example.com / password123');
        console.log('Viewer: bob.viewer@example.com / password123');
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
    }
    finally {
        await app.close();
    }
}
seed();
//# sourceMappingURL=seed.js.map