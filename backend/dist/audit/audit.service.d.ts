import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
interface LogData {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: any;
    ipAddress?: string;
}
export declare class AuditService {
    private auditRepository;
    constructor(auditRepository: Repository<AuditLog>);
    log(data: LogData): Promise<AuditLog>;
    findAll(filters?: {
        userId?: string;
        entityType?: string;
        limit?: number;
    }): Promise<AuditLog[]>;
}
export {};
