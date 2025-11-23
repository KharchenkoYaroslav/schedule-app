import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { AdminLog } from '../entities/admin-log.entity';
import { AddLogDto } from '../dto/add-log.dto';
import { GetLogsDto } from '../dto/get-logs.dto';

@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(AdminLog)
    private adminLogRepository: Repository<AdminLog>,
  ) {}

  async addLog(log: AddLogDto): Promise<void> {
    const newLog = this.adminLogRepository.create({
      adminId: log.adminId,
      details: log.details,
    });
    await this.adminLogRepository.save(newLog);
  }

  async getLogs(log: GetLogsDto): Promise<AdminLog[]> {
    const { adminId, count, order } = log;

    const options: FindManyOptions<AdminLog> = {
      take: count,
      order: {
        createdAt: order === 'first' ? 'ASC' : 'DESC',
      },
      where: adminId ? { adminId } : {},
    };

    const logs = await this.adminLogRepository.find(options);
    return logs;
  }
}
