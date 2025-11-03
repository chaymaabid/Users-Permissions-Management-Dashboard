import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import * as bcrypt from 'bcrypt';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🌱 Starting database seed...');

    const dataSource = app.get(DataSource);
    const permissionsRepo = dataSource.getRepository(Permission);
    const rolesRepo = dataSource.getRepository(Role);
    const usersRepo = dataSource.getRepository(User);

    console.log('Clearing existing data...');
    await dataSource.query('DELETE FROM user_roles');
    await dataSource.query('DELETE FROM role_permissions');
    await dataSource.query('DELETE FROM users');
    await dataSource.query('DELETE FROM roles');
    await dataSource.query('DELETE FROM permissions');
    await dataSource.query('DELETE FROM audit_logs');

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

    const getPermissions = (actions: string[]) =>
      permissions.filter(p => actions.includes(p.action));

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
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();