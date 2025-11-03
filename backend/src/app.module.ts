import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
 
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT as string) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rbac_db',
      autoLoadEntities: true,
      synchronize: true, 
    }),
    
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 10, 
    }]),
    
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AuditModule,
  ],
})
export class AppModule {}