import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { GroupService } from '../servises/group.service';
import { TeacherService } from '../servises/teacher.service';
import { ScheduleService } from '../servises/schedule.service';
import {
  SearchGroupInput,
  SearchGroupResponse,
} from '../dto/public/search-group.dto';
import {
  SearchTeacherInput,
  SearchTeacherResponse,
} from '../dto/public/search-teacher.dto';
import {
  GetGroupScheduleInput,
  GetTeacherScheduleInput,
  ScheduleResponse,
} from '../dto/public/public-schedule.dto';

@Controller('SheduleService')
export class PublicController {
  constructor(
    private readonly groupService: GroupService,
    private readonly teacherService: TeacherService,
    private readonly scheduleService: ScheduleService
  ) {}

  @GrpcMethod('SheduleService', 'searchGroup')
  async searchGroup(
    @Payload() input: SearchGroupInput
  ): Promise<SearchGroupResponse> {
    return this.groupService.searchGroup(input);
  }

  @GrpcMethod('SheduleService', 'searchTeacher')
  async searchTeacher(
    @Payload() input: SearchTeacherInput
  ): Promise<SearchTeacherResponse> {
    return this.teacherService.searchTeacher(input);
  }

  @GrpcMethod('SheduleService', 'getGroupSchedule')
  async getGroupSchedule(
    @Payload() input: GetGroupScheduleInput
  ): Promise<ScheduleResponse> {
    return this.scheduleService.getGroupSchedule(input);
  }

  @GrpcMethod('SheduleService', 'getTeacherSchedule')
  async getTeacherSchedule(
    @Payload() input: GetTeacherScheduleInput
  ): Promise<ScheduleResponse> {
    return this.scheduleService.getTeacherSchedule(input);
  }
}
