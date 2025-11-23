import { Module } from '@nestjs/common';
import { LoggerController } from './controllers/logger.controller';
import { LoggerService } from './services/logger.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AdminLog } from './entities/admin-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([AdminLog]),
  ],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class AppModule {}
