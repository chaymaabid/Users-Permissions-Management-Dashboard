import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
export declare class PermissionsService {
    private permissionsRepository;
    constructor(permissionsRepository: Repository<Permission>);
    findAll(): Promise<Permission[]>;
    findOne(id: string): Promise<Permission | null>;
}
