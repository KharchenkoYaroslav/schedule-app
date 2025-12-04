import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AdminLog } from '../entities/admin-log.entity';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const dbUrl = isTest ? process.env.LOGS_DATABASE_TEST_URL : process.env.LOGS_DATABASE_URL;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: dbUrl,
  entities: [AdminLog],
  synchronize: true,
  ssl: dbUrl?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
};
