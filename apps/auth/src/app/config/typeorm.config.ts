import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import * as dotenv from 'dotenv';
import { AllowedUser } from '../entities/allowed-users.entity';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const dbUrl = isTest ? process.env.AUTH_DATABASE_TEST_URL : process.env.AUTH_DATABASE_URL;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: dbUrl,
  entities: [User, AllowedUser],
  synchronize: true,
  ssl: dbUrl?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
};
