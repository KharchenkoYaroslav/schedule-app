import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Teacher } from '../entities/Teacher.entity';
import { Group } from '../entities/Group.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import { Schedule } from '../entities/Schedule.entity';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const dbUrl = isTest ? process.env.SCHEDULE_DATABASE_TEST_URL : process.env.SCHEDULE_DATABASE_URL;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: dbUrl,
  entities: [Teacher, Group, Curriculum, Schedule],
  synchronize: true,
  ssl: dbUrl?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
};
