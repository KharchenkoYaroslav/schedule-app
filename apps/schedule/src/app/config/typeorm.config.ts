import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Teacher } from '../entities/Teacher.entity';
import { Group } from '../entities/Group.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import { Schedule } from '../entities/Schedule.entity';

dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.SCHEDULE_DATABASE_URL,
  entities: [Teacher, Group, Curriculum, Schedule],
  synchronize: true,
  ssl: process.env.SCHEDULE_DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
};
