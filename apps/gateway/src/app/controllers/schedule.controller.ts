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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
import { SearchGroupResponse } from '../dto/schedule/response/search-group.response';
import { SearchTeacherResponse } from '../dto/schedule/response/search-teacher.response';
import { ScheduleResponse } from '../dto/schedule/response/schedule.response';
import { FindAllGroupsResponse } from '../dto/schedule/response/find-all-groups.response';
import { FindAllTeachersResponse } from '../dto/schedule/response/find-all-teachers.response';
import { FindAllCurriculumsResponse } from '../dto/schedule/response/find-all-curriculums.response';
import { GetPairsByCriteriaResponse } from '../dto/schedule/response/get-pairs-by-criteria.response';
import { GetPairInfoResponse } from '../dto/schedule/response/get-pair-info.response';

@ApiTags('Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly loggerService: LoggerService,
  ) {}

  // === Public Endpoints ===

  @ApiOperation({ summary: 'Search for a group' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SearchGroupResponse,
    description: 'List of groups matching the criteria',
  })
  @Get('search-group')
  async searchGroup(@Query() data: SearchGroupInput) {
    return this.scheduleService.searchGroup(data);
  }

  @ApiOperation({ summary: 'Search for a teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SearchTeacherResponse,
    description: 'List of teachers matching the criteria',
  })
  @Get('search-teacher')
  async searchTeacher(@Query() data: SearchTeacherInput) {
    return this.scheduleService.searchTeacher(data);
  }

  @ApiOperation({ summary: 'Get schedule for a specific group' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ScheduleResponse,
    description: 'Schedule for the requested group',
  })
  @Get('group-schedule')
  async getGroupSchedule(@Query() data: GetGroupScheduleInput) {
    return this.scheduleService.getGroupSchedule(data);
  }

  @ApiOperation({ summary: 'Get schedule for a specific teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ScheduleResponse,
    description: 'Schedule for the requested teacher',
  })
  @Get('teacher-schedule')
  async getTeacherSchedule(@Query() data: GetTeacherScheduleInput) {
    return this.scheduleService.getTeacherSchedule(data);
  }

  // === Admin Endpoints (Requires Auth) ===

  // Group CRUD
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllGroupsResponse,
    description: 'List of all groups',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/groups')
  async findAllGroups() {
    return this.scheduleService.findAllGroups();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Group created successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Group already exists',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/group')
  async createGroup(
    @Body() data: CreateGroupInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.createGroup(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Created group code: ${data.groupCode}, faculty: ${data.faculty}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Group not found' })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/group/:id')
  async updateGroup(
    @Param() { id }: IdParam,
    @Body() input: UpdateGroupRequest['input'],
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.updateGroup({ id, input });
    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Updated group ID: ${id} with changes: ${JSON.stringify(input)}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Group deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Group not found' })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/group/:id')
  async deleteGroup(
    @Param() { id }: IdParam,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteGroup({ id });
    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted group ID: ${id}`,
    });
  }

  // Teacher CRUD
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllTeachersResponse,
    description: 'List of all teachers',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/teachers')
  async findAllTeachers() {
    return this.scheduleService.findAllTeachers();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new teacher' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Teacher created successfully',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/teacher')
  async createTeacher(
    @Body() data: CreateTeacherInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.createTeacher(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Created teacher: ${data.fullName}, department: ${data.department}, post: ${data.post}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/teacher/:id')
  async updateTeacher(
    @Param() { id }: IdParam,
    @Body() input: UpdateTeacherRequest['input'],
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.updateTeacher({ id, input });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Updated teacher ID: ${id} with changes: ${JSON.stringify(
        input
      )}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a teacher' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teacher deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Teacher not found',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/teacher/:id')
  async deleteTeacher(
    @Param() { id }: IdParam,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteTeacher({ id });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted teacher ID: ${id}`,
    });
  }

  // Curriculum CRUD
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all curriculums' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindAllCurriculumsResponse,
    description: 'List of all curriculums',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/curriculums')
  async findAllCurriculums() {
    return this.scheduleService.findAllCurriculums();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new curriculum' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Curriculum created successfully',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/curriculum')
  async createCurriculum(
    @Body() data: CurriculumInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.createCurriculum(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Created curriculum: ${data.subjectName}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing curriculum' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Curriculum updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Curriculum not found',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/curriculum/:id')
  async updateCurriculum(
    @Param() { id }: IdParam,
    @Body() input: CurriculumInput,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.updateCurriculum({ id, input });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Updated curriculum ID: ${id} with changes: ${JSON.stringify(
        input
      )}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a curriculum' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Curriculum deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Curriculum not found',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/curriculum/:id')
  async deleteCurriculum(
    @Param() { id }: IdParam,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteCurriculum({ id });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted curriculum ID: ${id}`,
    });
  }

  // Schedule Management

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a schedule pair' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pair added successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Pair conflict or invalid data',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/pair')
  async addPair(
    @Body() data: AddPairDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.addPair(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Added pair for groups: ${data.groupsList.join(
        ', '
      )} and subject ID: ${data.subjectId}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a schedule pair' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pair updated successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pair not found' })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/pair')
  async editPair(
    @Body() data: EditPairDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.editPair(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Edited pair ID: ${data.id} with changes: ${JSON.stringify(
        data
      )}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule pair' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pair deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pair not found' })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/pair/:id')
  async deletePair(
    @Param() { id }: IdParam,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deletePair({ id });

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Deleted pair ID: ${id}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pairs matching criteria' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetPairsByCriteriaResponse,
    description: 'List of pairs matching criteria',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/pairs-by-criteria')
  async getPairsByCriteria(@Query() data: GetPairsByCriteriaDto) {
    return this.scheduleService.getPairsByCriteria(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed pair info' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: GetPairInfoResponse,
    description: 'Detailed information about the pair',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pair not found' })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/pair-info/:id')
  async getPairInfo(@Param() { id }: IdParam) {
    return this.scheduleService.getPairInfo({ id });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Swap pairs for a group' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pairs swapped successfully',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/swap-group-pairs')
  async swapGroupPairs(
    @Body() data: SwapGroupPairsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.swapGroupPairs(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Swapped group pairs in semester ${data.semester}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Swap pairs for a teacher' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pairs swapped successfully',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/swap-teacher-pairs')
  async swapTeacherPairs(
    @Body() data: SwapTeacherPairsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.swapTeacherPairs(data);

    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Swapped teacher pairs in semester ${data.semester}`,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update groups to next or privious year' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Groups updated successfully',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/update-groups')
  async updateGroups(
    @Body() data: UpdateGroupsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.updateGroups(data);
    this.loggerService.logAdminRequest({
      adminId: user.sub,
      details: `Executed batch group update action: ${data.action}`,
    });
  }

  // Logger Endpoints (Super Admin Only)

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system logs' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [LogDto],
    description: 'List of system logs',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get('admin/logs')
  async getLogs(@Query() data: GetLogsDto): Promise<LogDto[]> {
    return lastValueFrom(this.loggerService.getLogs(data));
  }
}
