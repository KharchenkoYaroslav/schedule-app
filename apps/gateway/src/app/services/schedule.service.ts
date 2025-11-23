import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, catchError } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { SearchGroupInput } from '../dto/schedule/input/search-group.input';
import { SearchGroupResponse } from '../dto/schedule/response/search-group.response';
import { SearchTeacherInput } from '../dto/schedule/input/search-teacher.input';
import { SearchTeacherResponse } from '../dto/schedule/response/search-teacher.response';
import { ScheduleResponse } from '../dto/schedule/response/schedule.response';
import { GetGroupScheduleInput } from '../dto/schedule/input/get-group-schedule.input';
import { GetTeacherScheduleInput } from '../dto/schedule/input/get-teacher-schedule.input';
import { CreateGroupInput } from '../dto/schedule/input/create-group.input';
import { UpdateGroupRequest } from '../dto/schedule/input/update-group.request';
import { FindAllGroupsResponse } from '../dto/schedule/response/find-all-groups.response';
import { CreateTeacherInput } from '../dto/schedule/input/create-teacher.input';
import { UpdateTeacherRequest } from '../dto/schedule/input/update-teacher.request';
import { FindAllTeachersResponse } from '../dto/schedule/response/find-all-teachers.response';
import { CurriculumInput } from '../dto/schedule/input/curriculum.input';
import { UpdateCurriculumRequest } from '../dto/schedule/input/update-curriculum.request';
import { FindAllCurriculumsResponse } from '../dto/schedule/response/find-all-curriculums.response';
import { AddPairDto } from '../dto/schedule/input/add-pair.dto';
import { EditPairDto } from '../dto/schedule/input/edit-pair.dto';
import { GetPairsByCriteriaDto } from '../dto/schedule/input/get-pairs-by-criteria.dto';
import { GetPairsByCriteriaResponse } from '../dto/schedule/response/get-pairs-by-criteria.response';
import { GetPairInfoResponse } from '../dto/schedule/response/get-pair-info.response';
import { SwapGroupPairsDto } from '../dto/schedule/input/swap-group-pairs.dto';
import { SwapTeacherPairsDto } from '../dto/schedule/input/swap-teacher-pairs.dto';
import { UpdateGroupsDto } from '../dto/schedule/input/update-groups.dto';
import { IdParam } from '../dto/schedule/type/id.type';

function mapGrpcCodeToHttpStatus(grpcCode: status): HttpStatus {
  switch (grpcCode) {
    case status.CANCELLED:
    case status.INVALID_ARGUMENT:
    case status.FAILED_PRECONDITION:
    case status.OUT_OF_RANGE:
      return HttpStatus.BAD_REQUEST;
    case status.DEADLINE_EXCEEDED:
      return HttpStatus.REQUEST_TIMEOUT;
    case status.NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case status.ALREADY_EXISTS:
    case status.ABORTED:
      return HttpStatus.CONFLICT;
    case status.PERMISSION_DENIED:
      return HttpStatus.FORBIDDEN;
    case status.UNAUTHENTICATED:
      return HttpStatus.UNAUTHORIZED;
    case status.UNIMPLEMENTED:
      return HttpStatus.NOT_IMPLEMENTED;
    case status.UNAVAILABLE:
      return HttpStatus.SERVICE_UNAVAILABLE;
    case status.RESOURCE_EXHAUSTED:
      return HttpStatus.TOO_MANY_REQUESTS;
    case status.OK:
      return HttpStatus.OK;
    case status.UNKNOWN:
    case status.INTERNAL:
    case status.DATA_LOSS:
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

interface BoolResponse {
  success: boolean;
}

interface AdminServiceGrpc {
  // Group CRUD
  findAllGroups(data: object): Observable<FindAllGroupsResponse>;
  createGroup(data: CreateGroupInput): Observable<BoolResponse>;
  updateGroup(data: UpdateGroupRequest): Observable<BoolResponse>;
  deleteGroup(data: IdParam ): Observable<BoolResponse>;

  // Teacher CRUD
  findAllTeachers(data: object): Observable<FindAllTeachersResponse>;
  createTeacher(data: CreateTeacherInput): Observable<BoolResponse>;
  updateTeacher(data: UpdateTeacherRequest): Observable<BoolResponse>;
  deleteTeacher(data: IdParam ): Observable<BoolResponse>;

  // Curriculum CRUD
  findAllCurriculums(data: object): Observable<FindAllCurriculumsResponse>;
  createCurriculum(data: CurriculumInput): Observable<BoolResponse>;
  updateCurriculum(data: UpdateCurriculumRequest): Observable<BoolResponse>;
  deleteCurriculum(data: IdParam ): Observable<BoolResponse>;

  // Schedule Management
  addPair(data: AddPairDto): Observable<BoolResponse>;
  editPair(data: EditPairDto): Observable<BoolResponse>;
  deletePair(data: IdParam ): Observable<BoolResponse>;
  getPairsByCriteria(data: GetPairsByCriteriaDto): Observable<GetPairsByCriteriaResponse>;
  getPairInfo(data: IdParam ): Observable<GetPairInfoResponse>;
  swapGroupPairs(data: SwapGroupPairsDto): Observable<BoolResponse>;
  swapTeacherPairs(data: SwapTeacherPairsDto): Observable<BoolResponse>;
  updateGroups(data: UpdateGroupsDto): Observable<BoolResponse>;
}

interface SheduleServiceGrpc {
  searchGroup(data: SearchGroupInput): Observable<SearchGroupResponse>;
  searchTeacher(data: SearchTeacherInput): Observable<SearchTeacherResponse>;
  getGroupSchedule(data: GetGroupScheduleInput): Observable<ScheduleResponse>;
  getTeacherSchedule(data: GetTeacherScheduleInput): Observable<ScheduleResponse>;
}

@Injectable()
export class ScheduleService {
  private adminService!: AdminServiceGrpc;
  private publicService!: SheduleServiceGrpc;

  constructor(@Inject('SCHEDULE_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.adminService = this.client.getService<AdminServiceGrpc>('AdminService');
    this.publicService = this.client.getService<SheduleServiceGrpc>('SheduleService');
  }

  private handleRpcCall<T>(observable: Observable<T>): Promise<T> {
    return firstValueFrom(observable.pipe(
      catchError(error => {
        const status =
          'code' in error && typeof error.code === 'number'
            ? mapGrpcCodeToHttpStatus(error.code)
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = 'details' in error ? error.details : error.message || 'Internal Server Error';

        throw new HttpException(message, status);
      })
    ));
  }

  // === Public Service Methods (SheduleService) ===

  async searchGroup(data: SearchGroupInput): Promise<SearchGroupResponse> {
    return this.handleRpcCall(this.publicService.searchGroup(data));
  }

  async searchTeacher(data: SearchTeacherInput): Promise<SearchTeacherResponse> {
    return this.handleRpcCall(this.publicService.searchTeacher(data));
  }

  async getGroupSchedule(data: GetGroupScheduleInput): Promise<ScheduleResponse> {
    return this.handleRpcCall(this.publicService.getGroupSchedule(data));
  }

  async getTeacherSchedule(data: GetTeacherScheduleInput): Promise<ScheduleResponse> {
    return this.handleRpcCall(this.publicService.getTeacherSchedule(data));
  }

  // === Admin Service Methods (AdminService) ===

  // Group CRUD
  async findAllGroups(): Promise<FindAllGroupsResponse> {
    return this.handleRpcCall(this.adminService.findAllGroups({}));
  }
  async createGroup(data: CreateGroupInput): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.createGroup(data));
  }
  async updateGroup(data: UpdateGroupRequest): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.updateGroup(data));
  }
  async deleteGroup(data: IdParam ): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.deleteGroup(data));
  }

  // Teacher CRUD
  async findAllTeachers(): Promise<FindAllTeachersResponse> {
    return this.handleRpcCall(this.adminService.findAllTeachers({}));
  }
  async createTeacher(data: CreateTeacherInput): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.createTeacher(data));
  }
  async updateTeacher(data: UpdateTeacherRequest): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.updateTeacher(data));
  }
  async deleteTeacher(data: IdParam ): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.deleteTeacher(data));
  }

  // Curriculum CRUD
  async findAllCurriculums(): Promise<FindAllCurriculumsResponse> {
    return this.handleRpcCall(this.adminService.findAllCurriculums({}));
  }
  async createCurriculum(data: CurriculumInput): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.createCurriculum(data));
  }
  async updateCurriculum(data: UpdateCurriculumRequest): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.updateCurriculum(data));
  }
  async deleteCurriculum(data: IdParam ): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.deleteCurriculum(data));
  }

  // Schedule Management
  async addPair(data: AddPairDto): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.addPair(data));
  }
  async editPair(data: EditPairDto): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.editPair(data));
  }
  async deletePair(data: IdParam ): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.deletePair(data));
  }
  async getPairsByCriteria(data: GetPairsByCriteriaDto): Promise<GetPairsByCriteriaResponse> {
    return this.handleRpcCall(this.adminService.getPairsByCriteria(data));
  }
  async getPairInfo(data: IdParam ): Promise<GetPairInfoResponse> {
    return this.handleRpcCall(this.adminService.getPairInfo(data));
  }
  async swapGroupPairs(data: SwapGroupPairsDto): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.swapGroupPairs(data));
  }
  async swapTeacherPairs(data: SwapTeacherPairsDto): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.swapTeacherPairs(data));
  }
  async updateGroups(data: UpdateGroupsDto): Promise<BoolResponse> {
    return this.handleRpcCall(this.adminService.updateGroups(data));
  }
}
