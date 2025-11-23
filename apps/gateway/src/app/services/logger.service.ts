import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddLogDto } from '../dto/logger/add-log.dto';
import { GetLogsDto } from '../dto/logger/get-logs.dto';
import { LogDto } from '../dto/logger/log.dto';
import { Observable } from 'rxjs';

@Injectable()
export class LoggerService {
  constructor(
    @Inject('LOGGER_PACKAGE') private readonly loggerClient: ClientProxy,
  ) {}

  public logAdminRequest(data: AddLogDto): void {
    this.loggerClient.emit('logger.addLog', data).subscribe();
  }

  public getLogs(dto: GetLogsDto): Observable<LogDto[]> {
    return this.loggerClient.send('logger.getLogs', dto);
  }
}
