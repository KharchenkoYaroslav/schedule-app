import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ScheduleController } from './controllers/schedule.controller';
import { ScheduleService } from './services/schedule.service';
import { LoggerService } from './services/logger.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 300000,
        limit: 10,
      },
    ]),
    ClientsModule.register([
      {
        name: 'AUTH_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(__dirname, 'proto/auth.proto'),
          url: `${process.env.AUTH_SERVICE_URL || '0.0.0.0:4010'}`,
        },
      },
      {
        name: 'SCHEDULE_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'schedule',
          protoPath: join(__dirname, 'proto/schedule.proto'),
          url: `${process.env.SCHEDULE_SERVICE_URL || '0.0.0.0:4020'}`,
        },
      },
      {
        name: 'LOGGER_PACKAGE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672'],
          queue: 'logger_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
  ],
  controllers: [AuthController, ScheduleController],
  providers: [AuthService, ScheduleService, LoggerService],
})
export class AppModule {}
