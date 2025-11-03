import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: LogData) {
    const auditLog = this.auditRepository.create(data);
    return this.auditRepository.save(auditLog);
  }

  async findAll(filters?: { userId?: string; entityType?: string; limit?: number }) {
    const query = this.auditRepository.createQueryBuilder('audit');

    if (filters?.userId) {
      query.where('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }

    query.orderBy('audit.createdAt', 'DESC');

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }
}