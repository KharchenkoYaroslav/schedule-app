import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './controllers/admin.controller';
import { PublicController } from './controllers/public.controller';
import { GroupService } from './servises/group.service';
import { TeacherService } from './servises/teacher.service';
import { CurriculumService } from './servises/curriculum.service';
import { ScheduleService } from './servises/schedule.service';
import { Group } from './entities/Group.entity';
import { Teacher } from './entities/Teacher.entity';
import { Schedule } from './entities/Schedule.entity';
import { Curriculum } from './entities/Curriculum.entity';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Group, Teacher, Schedule, Curriculum]),
  ],
  controllers: [AdminController, PublicController],
  providers: [GroupService, TeacherService, CurriculumService, ScheduleService],
})
export class AppModule {}
