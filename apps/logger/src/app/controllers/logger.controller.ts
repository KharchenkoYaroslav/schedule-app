import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiPub } from 'nestjs-asyncapi';
import { AddLogDto } from '../dto/add-log.dto';
import { GetLogsDto } from '../dto/get-logs.dto';
import { LogDto } from '../dto/log.dto';
import { AdminLog } from '../entities/admin-log.entity';
import { LoggerService } from '../services/logger.service';

@Controller()
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @AsyncApiPub({
    channel: 'logger.addLog',
    summary: 'Add new log',
    description: 'Listens for messages to create a record in admin logs',
    message: {
      payload: AddLogDto,
    },
  })
  @MessagePattern('logger.addLog')
  async addLog(@Payload() dto: AddLogDto): Promise<void> {
    await this.loggerService.addLog(dto);
  }

  @AsyncApiPub({
    channel: 'logger.getLogs',
    summary: 'Get logs list',
    description: 'Request to retrieve log history with filtering',
    message: {
      payload: GetLogsDto,
    },
  })
  @MessagePattern('logger.getLogs')
  async getLogs(@Payload() dto: GetLogsDto): Promise<LogDto[]> {
    const logs: AdminLog[] = await this.loggerService.getLogs(dto);
    return logs.map((log) => new LogDto(log));
  }
}
