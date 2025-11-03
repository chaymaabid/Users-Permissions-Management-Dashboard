export declare class AuditLog {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: any;
    ipAddress: string;
    createdAt: Date;
}
