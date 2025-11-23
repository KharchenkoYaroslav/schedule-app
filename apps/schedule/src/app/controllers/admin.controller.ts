import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { CurriculumService } from '../servises/curriculum.service';
import { GroupService } from '../servises/group.service';
import { TeacherService } from '../servises/teacher.service';
import { ScheduleService } from '../servises/schedule.service';
import {
  CurriculumInput,
  FindAllCurriculumsResponse,
} from '../dto/admin/curriculum.dto';
import {CreateGroupInput, UpdateGroupInput, FindAllGroupsResponse } from '../dto/admin/group.dto';
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  FindAllTeachersResponse,
} from '../dto/admin/teacher.dto';
import {
  AddPairDto,
  EditPairDto,
  DeletePairDto,
  GetPairsByCriteriaDto,
  GetPairsByCriteriaResponse,
  GetPairInfoResponse,
  SwapGroupPairsDto,
  SwapTeacherPairsDto,
  UpdateGroupsDto,
} from '../dto/admin/schedule.dto';

@Controller('AdminService')
export class AdminController {
  constructor(
    private readonly curriculumService: CurriculumService,
    private readonly groupService: GroupService,
    private readonly teacherService: TeacherService,
    private readonly scheduleService: ScheduleService
  ) {}

  // --- Group CRUD ---

  @GrpcMethod('AdminService', 'findAllGroups')
  async findAllGroups(): Promise<FindAllGroupsResponse> {
    return this.groupService.findAllGroups();
  }

  @GrpcMethod('AdminService', 'createGroup')
  async createGroup(@Payload() input: CreateGroupInput): Promise<{ success: boolean }> {
    await this.groupService.createGroup(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'updateGroup')
  async updateGroup(
    @Payload('id') id: string,
    @Payload('input') input: UpdateGroupInput
  ): Promise<{ success: boolean }> {
    await this.groupService.updateGroup(id, input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'deleteGroup')
  async deleteGroup(@Payload('id') id: string): Promise<{ success: boolean }> {
    await this.groupService.deleteGroup(id);
    return { success: true };
  }

  // --- Teacher CRUD ---

  @GrpcMethod('AdminService', 'findAllTeachers')
  async findAllTeachers(): Promise<FindAllTeachersResponse> {
    return this.teacherService.findAllTeachers();
  }

  @GrpcMethod('AdminService', 'createTeacher')
  async createTeacher(@Payload() input: CreateTeacherInput): Promise<{ success: boolean }> {
    await this.teacherService.createTeacher(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'updateTeacher')
  async updateTeacher(
    @Payload('id') id: string,
    @Payload('input') input: UpdateTeacherInput
  ): Promise<{ success: boolean }> {
    await this.teacherService.updateTeacher(id, input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'deleteTeacher')
  async deleteTeacher(@Payload('id') id: string): Promise<{ success: boolean }> {
    await this.teacherService.deleteTeacher(id);
    return { success: true };
  }

  // --- Curriculum CRUD ---

  @GrpcMethod('AdminService', 'findAllCurriculums')
  async findAllCurriculums(): Promise<FindAllCurriculumsResponse> {
    return this.curriculumService.findAllCurriculums();
  }

  @GrpcMethod('AdminService', 'createCurriculum')
  async createCurriculum(
    @Payload() input: CurriculumInput
  ): Promise<{ success: boolean }> {
    await this.curriculumService.createCurriculum(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'updateCurriculum')
  async updateCurriculum(
    @Payload('id') id: string,
    @Payload('input') input: CurriculumInput
  ): Promise<{ success: boolean }> {
    await this.curriculumService.updateCurriculum(id, input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'deleteCurriculum')
  async deleteCurriculum(@Payload('id') id: string): Promise<{ success: boolean }> {
    await this.curriculumService.deleteCurriculum(id);
    return { success: true };
  }

  // --- Schedule Management ---

  @GrpcMethod('AdminService', 'addPair')
  async addPair(@Payload() input: AddPairDto): Promise<{ success: boolean }> {
    await this.scheduleService.addPair(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'editPair')
  async editPair(@Payload() input: EditPairDto): Promise<{ success: boolean }> {
    await this.scheduleService.editPair(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'deletePair')
  async deletePair(@Payload() input: DeletePairDto): Promise<{ success: boolean }> {
    await this.scheduleService.deletePair(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'getPairsByCriteria')
  async getPairsByCriteria(
    @Payload() input: GetPairsByCriteriaDto
  ): Promise<GetPairsByCriteriaResponse> {
    return this.scheduleService.getPairsByCriteria(input);
  }

  @GrpcMethod('AdminService', 'getPairInfo')
  async getPairInfo(@Payload('id') id: string): Promise<GetPairInfoResponse> {
    return this.scheduleService.getPairInfo({ id });
  }

  @GrpcMethod('AdminService', 'swapGroupPairs')
  async swapGroupPairs(@Payload() input: SwapGroupPairsDto): Promise<{ success: boolean }> {
    await this.scheduleService.swapGroupPairs(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'swapTeacherPairs')
  async swapTeacherPairs(@Payload() input: SwapTeacherPairsDto): Promise<{ success: boolean }> {
    await this.scheduleService.swapTeacherPairs(input);
    return { success: true };
  }

  @GrpcMethod('AdminService', 'updateGroups')
  async updateGroups(@Payload() input: UpdateGroupsDto): Promise<{ success: boolean }> {
    await this.scheduleService.updateGroups(input);
    return { success: true };
  }
}
