import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    findAll(userId?: string, entityType?: string, limit?: number): Promise<import("./entities/audit-log.entity").AuditLog[]>;
}
