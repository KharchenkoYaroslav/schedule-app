import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AdminLog } from '../entities/admin-log.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.LOGS_DATABASE_URL,
  entities: [AdminLog],
  synchronize: true,
  ssl: process.env.LOGS_DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
};
