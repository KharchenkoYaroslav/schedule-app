import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ScheduleService } from '../services/schedule.service';
import { LoggerService } from '../services/logger.service';
import { SearchGroupInput } from '../dto/schedule/input/search-group.input';
import { SearchTeacherInput } from '../dto/schedule/input/search-teacher.input';
import { GetGroupScheduleInput } from '../dto/schedule/input/get-group-schedule.input';
import { GetTeacherScheduleInput } from '../dto/schedule/input/get-teacher-schedule.input';
import { CreateGroupInput } from '../dto/schedule/input/create-group.input';
import { UpdateGroupRequest } from '../dto/schedule/input/update-group.request';
import { CreateTeacherInput } from '../dto/schedule/input/create-teacher.input';
import { UpdateTeacherRequest } from '../dto/schedule/input/update-teacher.request';
import { CurriculumInput } from '../dto/schedule/input/curriculum.input';
import { AddPairDto } from '../dto/schedule/input/add-pair.dto';
import { EditPairDto } from '../dto/schedule/input/edit-pair.dto';
import { GetPairsByCriteriaDto } from '../dto/schedule/input/get-pairs-by-criteria.dto';
import { SwapGroupPairsDto } from '../dto/schedule/input/swap-group-pairs.dto';
import { SwapTeacherPairsDto } from '../dto/schedule/input/swap-teacher-pairs.dto';
import { UpdateGroupsDto } from '../dto/schedule/input/update-groups.dto';
import { GetLogsDto } from '../dto/logger/get-logs.dto';
import { LogDto } from '../dto/logger/log.dto';
import { RestAuthGuard, Roles } from '../guards/auth.guard';
import { IdParam } from '../dto/schedule/type/id.type';
import { UserRole } from '../dto/auth/types/user-role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { CurrentUserPayload } from '../decorators/current-user.decorator';

@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly loggerService: LoggerService,
  ) {}

  // === Public Endpoints ===

  @Get('search-group')
  async searchGroup(@Query() data: SearchGroupInput) {
    return this.scheduleService.searchGroup(data);
  }

  @Get('search-teacher')
  async searchTeacher(@Query() data: SearchTeacherInput) {
    return this.scheduleService.searchTeacher(data);
  }

  @Get('group-schedule')
  async getGroupSchedule(@Query() data: GetGroupScheduleInput) {
    return this.scheduleService.getGroupSchedule(data);
  }

  @Get('teacher-schedule')
  async getTeacherSchedule(@Query() data: GetTeacherScheduleInput) {
    return this.scheduleService.getTeacherSchedule(data);
  }

  // === Admin Endpoints (Requires Auth) ===

  // Group CRUD
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/groups')
  async findAllGroups() {
    return this.scheduleService.findAllGroups();
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/group')
  async createGroup(@Body() data: CreateGroupInput, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.createGroup(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Created group code: ${data.groupCode}, faculty: ${data.faculty}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/group/:id')
  async updateGroup(@Param() { id }: IdParam, @Body() input: UpdateGroupRequest['input'], @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.updateGroup({ id, input });
    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Updated group ID: ${id} with changes: ${JSON.stringify(input)}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/group/:id')
  async deleteGroup(@Param() { id }: IdParam, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.deleteGroup({ id });
    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted group ID: ${id}`,
    });
  }

  // Teacher CRUD
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/teachers')
  async findAllTeachers() {
    return this.scheduleService.findAllTeachers();
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/teacher')
  async createTeacher(@Body() data: CreateTeacherInput, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.createTeacher(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Created teacher: ${data.fullName}, department: ${data.department}, post: ${data.post}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/teacher/:id')
  async updateTeacher(@Param() { id }: IdParam, @Body() input: UpdateTeacherRequest['input'], @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.updateTeacher({ id, input });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Updated teacher ID: ${id} with changes: ${JSON.stringify(input)}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/teacher/:id')
  async deleteTeacher(@Param() { id }: IdParam, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.deleteTeacher({ id });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted teacher ID: ${id}`,
    });
  }

  // Curriculum CRUD
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/curriculums')
  async findAllCurriculums() {
    return this.scheduleService.findAllCurriculums();
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/curriculum')
  async createCurriculum(@Body() data: CurriculumInput, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.createCurriculum(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Created curriculum: ${data.subjectName}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/curriculum/:id')
  async updateCurriculum(@Param() { id }: IdParam, @Body() input: CurriculumInput, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.updateCurriculum({ id, input });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Updated curriculum ID: ${id} with changes: ${JSON.stringify(input)}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/curriculum/:id')
  async deleteCurriculum(@Param() { id }: IdParam, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.deleteCurriculum({ id });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted curriculum ID: ${id}`,
    });
  }

  // Schedule Management

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/pair')
  async addPair(@Body() data: AddPairDto, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.addPair(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Added pair for groups: ${data.groupsList.join(', ')} and subject ID: ${data.subjectId}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/pair')
  async editPair(@Body() data: EditPairDto, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.editPair(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Edited pair ID: ${data.id} with changes: ${JSON.stringify(data)}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/pair/:id')
  async deletePair(@Param() { id }: IdParam, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.deletePair({ id });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted pair ID: ${id}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/pairs-by-criteria')
  async getPairsByCriteria(@Query() data: GetPairsByCriteriaDto) {
    return this.scheduleService.getPairsByCriteria(data);
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/pair-info/:id')
  async getPairInfo(@Param() { id }: IdParam) {
    return this.scheduleService.getPairInfo({ id });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/swap-group-pairs')
  async swapGroupPairs(@Body() data: SwapGroupPairsDto, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.swapGroupPairs(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Swapped group pairs in semester ${data.semester}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/swap-teacher-pairs')
  async swapTeacherPairs(@Body() data: SwapTeacherPairsDto, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.swapTeacherPairs(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Swapped teacher pairs in semester ${data.semester}`,
    });
  }

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/update-groups')
  async updateGroups(@Body() data: UpdateGroupsDto, @CurrentUser() user: CurrentUserPayload,) {
    await this.scheduleService.updateGroups(data);
    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Executed batch group update action: ${data.action}`,
    });
  }

  // Logger Endpoints (Super Admin Only)

  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/logs')
  async getLogs(@Query() data: GetLogsDto): Promise<LogDto[]> {
    return lastValueFrom(this.loggerService.getLogs(data));
  }
}
