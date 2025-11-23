import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddLogDto } from '../dto/add-log.dto';
import { GetLogsDto } from '../dto/get-logs.dto';
import { LogDto } from '../dto/log.dto';
import { AdminLog } from '../entities/admin-log.entity';
import { LoggerService } from '../services/logger.service';

@Controller()
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @MessagePattern('logger.addLog')
  async addLog(@Payload() dto: AddLogDto): Promise<void> {
    await this.loggerService.addLog(dto);
  }

  @MessagePattern('logger.getLogs')
  async getLogs(@Payload() dto: GetLogsDto): Promise<LogDto[]> {
    const logs: AdminLog[] = await this.loggerService.getLogs(dto);
    return logs.map((log) => new LogDto(log));
  }
}
