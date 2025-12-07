import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Schedule } from '../entities/Schedule.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Group } from '../entities/Group.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import { CurriculumService } from './curriculum.service';
import { DataSource, Repository, SelectQueryBuilder, EntityManager} from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { SemesterNumber } from '../types/SemesterNumber.enum';
import { WeekNumber } from '../types/WeekNumber.enum';
import { DayNumber } from '../types/DayNumber.enum';
import { PairNumber } from '../types/PairNumber.enum';
import { LessonType } from '../types/LessonType.enum';
import { VisitFormat } from '../types/VisitFormat.enum';
import { TeacherPost } from '../types/TeacherPost.enum';
import {
  AddPairDto,
  DeletePairDto,
  EditPairDto,
  GetPairsByCriteriaDto,
  GetPairsInfoDto,
  SwapGroupLocationDto,
  SwapGroupPairsDto,
  SwapTeacherLocationDto,
  SwapTeacherPairsDto,
  UpdateGroupsDto,
} from '../dto/admin/schedule.dto';
import { GetGroupScheduleInput, GetTeacherScheduleInput } from '../dto/public/public-schedule.dto';

jest.mock('typeorm', () => {
  const original = jest.requireActual('typeorm');
  return {
    ...original,
    In: jest.fn((val) => val),
  };
});

type MockRepository<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = unknown>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('ScheduleService', () => {
  let service: ScheduleService;
  let scheduleRepo: MockRepository<Schedule>;
  let teacherRepo: MockRepository<Teacher>;
  let groupRepo: MockRepository<Group>;

  let curriculumServiceMock: {
    recalculateCurriculumCorrespondence: jest.Mock;
    findOneById: jest.Mock;
    checkCorrespondence: jest.Mock;
  };

  let mockQueryBuilder: Partial<Record<keyof SelectQueryBuilder<Schedule>, jest.Mock>>;
  let mockEntityManager: Partial<Record<keyof EntityManager, jest.Mock>>;
  let mockQueryRunner: {
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
    manager: Partial<Record<keyof EntityManager, jest.Mock>>;
  };
  let mockDataSource: Partial<Record<keyof DataSource, jest.Mock>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
    };

    mockEntityManager = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockEntityManager,
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const mockCurriculumServiceObj = {
      recalculateCurriculumCorrespondence: jest.fn(),
      findOneById: jest.fn(),
      checkCorrespondence: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: createMockRepository<Schedule>(),
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: createMockRepository<Teacher>(),
        },
        {
          provide: getRepositoryToken(Group),
          useValue: createMockRepository<Group>(),
        },
        {
          provide: CurriculumService,
          useValue: mockCurriculumServiceObj,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    scheduleRepo = module.get(getRepositoryToken(Schedule));
    teacherRepo = module.get(getRepositoryToken(Teacher));
    groupRepo = module.get(getRepositoryToken(Group));
    curriculumServiceMock = module.get(CurriculumService) as unknown as typeof mockCurriculumServiceObj;

    (scheduleRepo.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addPair', () => {
    const input: AddPairDto = {
      subjectId: 'sub1',
      teachersList: ['t1'],
      groupsList: ['g1'],
      semesterNumber: SemesterNumber.FIRST,
      weekNumber: WeekNumber.FIRST,
      dayNumber: DayNumber.MONDAY,
      pairNumber: PairNumber.FIRST,
      lessonType: LessonType.LECTURE,
      visitFormat: VisitFormat.ONLINE,
      audience: '101',
    };

    it('should throw RpcException if teacher has a conflict', async () => {
      const mockCurriculum = {
        id: 'sub1',
        subjectName: 'Test Subject',
        correspondence: true,
        relatedTeachers: [{ id: 't1' } as unknown as Teacher],
        relatedGroups: [{ id: 'g1' } as unknown as Group],
      } as unknown as Curriculum;

      curriculumServiceMock.findOneById.mockResolvedValue(mockCurriculum);

      const existingConflictPair = {
        id: 'existing-pair-id',
        teachersList: ['t1'],
      } as unknown as Schedule;

      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(existingConflictPair);

      teacherRepo.findOne?.mockResolvedValue({
        id: 't1',
        fullName: 'Ivanov I.I.',
      } as unknown as Teacher);

      await expect(service.addPair(input)).rejects.toThrow(RpcException);
      await expect(service.addPair(input)).rejects.toMatchObject({
        message: expect.stringContaining('Ivanov I.I.'),
      });
    });

    it('should add pair successfully when no conflicts', async () => {
      const mockCurriculum = {
        id: 'sub1',
        subjectName: 'Test Subject',
        correspondence: true,
        relatedTeachers: [{ id: 't1' } as unknown as Teacher],
        relatedGroups: [{ id: 'g1' } as unknown as Group],
      } as unknown as Curriculum;

      curriculumServiceMock.findOneById.mockResolvedValue(mockCurriculum);
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      const newPair = { ...input, id: 'new-pair-id' } as unknown as Schedule;
      scheduleRepo.create?.mockReturnValue(newPair);
      scheduleRepo.save?.mockResolvedValue(newPair);

      await service.addPair(input);

      expect(scheduleRepo.create).toHaveBeenCalledWith({
        ...input,
        audience: input.audience || null,
      });
      expect(scheduleRepo.save).toHaveBeenCalledWith(newPair);
      expect(curriculumServiceMock.recalculateCurriculumCorrespondence).toHaveBeenCalledWith('sub1');
    });

    it('should throw RpcException if curriculum not found', async () => {
      curriculumServiceMock.findOneById.mockResolvedValue(null);

      await expect(service.addPair(input)).rejects.toThrow(RpcException);
      await expect(service.addPair(input)).rejects.toMatchObject({
        message: expect.stringContaining('Curriculum with ID sub1 not found'),
      });
    });
  });

  describe('editPair', () => {
    const updateInput: EditPairDto = {
      id: 'pair-1',
      subjectId: 'sub2',
      teachersList: ['t1'],
      groupsList: ['g1'],
      semesterNumber: SemesterNumber.FIRST,
      weekNumber: WeekNumber.SECOND,
      dayNumber: DayNumber.TUESDAY,
      pairNumber: PairNumber.SECOND,
      lessonType: LessonType.PRACTICE,
      visitFormat: VisitFormat.OFFLINE,
      audience: '202',
    };

    it('should edit pair and recalculate correspondence for both old and new subjects', async () => {
      const existingPair = {
        id: 'pair-1',
        subjectId: 'sub1',
        teachersList: ['t1'],
        semesterNumber: SemesterNumber.FIRST,
        weekNumber: WeekNumber.SECOND,
        dayNumber: DayNumber.TUESDAY,
        pairNumber: PairNumber.SECOND,
      } as unknown as Schedule;

      scheduleRepo.findOneBy?.mockResolvedValue(existingPair);

      const mockCurriculum = {
        id: 'sub2',
        relatedTeachers: [{ id: 't1' }],
        relatedGroups: [{ id: 'g1' }]
      } as unknown as Curriculum;
      curriculumServiceMock.findOneById.mockResolvedValue(mockCurriculum);

      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      await service.editPair(updateInput);

      expect(scheduleRepo.update).toHaveBeenCalled();
      expect(curriculumServiceMock.recalculateCurriculumCorrespondence).toHaveBeenCalledWith('sub1');
      expect(curriculumServiceMock.recalculateCurriculumCorrespondence).toHaveBeenCalledWith('sub2');
    });

    it('should throw if pair not found', async () => {
      scheduleRepo.findOneBy?.mockResolvedValue(null);
      await expect(service.editPair(updateInput)).rejects.toThrow(RpcException);
    });
  });

  describe('getGroupSchedule', () => {
    const input: GetGroupScheduleInput = { groupId: 'g1', semesterNumber: 1 };

    it('should throw RpcException if group not found', async () => {
      groupRepo.findOneBy?.mockResolvedValue(null);

      await expect(service.getGroupSchedule(input)).rejects.toThrow(RpcException);
      expect(groupRepo.findOneBy).toHaveBeenCalledWith({ id: input.groupId });
    });

    it('should return empty schedule if no pairs found', async () => {
      groupRepo.findOneBy?.mockResolvedValue({ id: 'g1', groupCode: 'IP-21' } as unknown as Group);
      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getGroupSchedule(input);

      expect(result).toEqual({ schedule: [], identifier: 'IP-21' });
    });

    it('should return mapped schedule items', async () => {
      groupRepo.findOneBy?.mockResolvedValue({ id: 'g1', groupCode: 'IP-21' } as unknown as Group);

      const mockSchedules = [{
        weekNumber: WeekNumber.FIRST,
        dayNumber: DayNumber.MONDAY,
        pairNumber: PairNumber.FIRST,
        lessonType: LessonType.LECTURE,
        teachersList: ['t1'],
        subject: { subjectName: 'Math' },
        visitFormat: VisitFormat.ONLINE,
        audience: '101'
      }];

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockSchedules);
      teacherRepo.find?.mockResolvedValue([{ id: 't1', fullName: 'Teacher 1', post: TeacherPost.DOCENT }] as unknown as Teacher[]);

      const result = await service.getGroupSchedule(input);

      expect(result.identifier).toBe('IP-21');
      expect(result.schedule).toHaveLength(1);
      expect(result.schedule[0].subjectName).toBe('Math');
      expect(result.schedule[0].teachersList).toHaveLength(1);
      expect(result.schedule[0].teachersList?.[0].name).toBe('Teacher 1');
    });
  });

  describe('getTeacherSchedule', () => {
    const input: GetTeacherScheduleInput = { teacherId: 't1', semesterNumber: 1 };

    it('should throw RpcException if teacher not found', async () => {
      teacherRepo.findOneBy?.mockResolvedValue(null);
      await expect(service.getTeacherSchedule(input)).rejects.toThrow(RpcException);
    });

    it('should return mapped teacher schedule', async () => {
      teacherRepo.findOneBy?.mockResolvedValue({ id: 't1', fullName: 'Ivanov' } as unknown as Teacher);

      const mockSchedules = [{
        weekNumber: WeekNumber.FIRST,
        dayNumber: DayNumber.MONDAY,
        pairNumber: PairNumber.FIRST,
        lessonType: LessonType.LECTURE,
        groupsList: ['g1'],
        subject: { subjectName: 'Math' },
        visitFormat: VisitFormat.ONLINE
      }];

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockSchedules);
      groupRepo.find?.mockResolvedValue([{ id: 'g1', groupCode: 'IP-21', faculty: 'FICT' }] as unknown as Group[]);

      const result = await service.getTeacherSchedule(input);

      expect(result.identifier).toBe('Ivanov');
      expect(result.schedule[0].groupsList).toHaveLength(1);
      expect(result.schedule[0].groupsList?.[0].groupCode).toBe('IP-21');
    });
  });

  describe('deletePair', () => {
    const deleteInput: DeletePairDto = { id: 'pair-id-1' };

    it('should throw RpcException if pair not found', async () => {
      scheduleRepo.findOneBy?.mockResolvedValue(null);

      await expect(service.deletePair(deleteInput)).rejects.toThrow(RpcException);
    });

    it('should delete pair and recalculate curriculum correspondence', async () => {
      const mockPair = { id: 'pair-id-1', subjectId: 'sub1' };
      scheduleRepo.findOneBy?.mockResolvedValue(mockPair as unknown as Schedule);
      scheduleRepo.delete?.mockResolvedValue({ affected: 1 });

      await service.deletePair(deleteInput);

      expect(scheduleRepo.delete).toHaveBeenCalledWith('pair-id-1');
      expect(curriculumServiceMock.recalculateCurriculumCorrespondence).toHaveBeenCalledWith('sub1');
    });
  });

  describe('getPairsByCriteria', () => {
    it('should return pairs based on criteria', async () => {
      const input: GetPairsByCriteriaDto = {
        semester: SemesterNumber.FIRST,
        groupId: 'g1',
        teacherId: 't1'
      };

      const mockSchedules = [{
        id: 's1',
        semesterNumber: SemesterNumber.FIRST,
        weekNumber: WeekNumber.FIRST,
        dayNumber: DayNumber.MONDAY,
        pairNumber: PairNumber.FIRST,
        subject: { subjectName: 'Math' }
      }];

      (mockQueryBuilder.getMany as jest.Mock).mockResolvedValue(mockSchedules);

      const result = await service.getPairsByCriteria(input);

      expect(result.pairs).toHaveLength(1);
      expect(result.pairs[0].subjectName).toBe('Math');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPairInfo', () => {
    it('should return detailed info', async () => {
      const input: GetPairsInfoDto = { id: 's1' };
      const mockPair = {
        id: 's1',
        subjectId: 'sub1',
        groupsList: ['g1'],
        teachersList: ['t1'],
        lessonType: LessonType.LECTURE,
        visitFormat: VisitFormat.ONLINE,
        audience: '101'
      };

      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(mockPair);
      groupRepo.find?.mockResolvedValue([{ id: 'g1', groupCode: 'IP-21' }] as unknown as Group[]);
      teacherRepo.find?.mockResolvedValue([{ id: 't1', fullName: 'Ivanov' }] as unknown as Teacher[]);

      const result = await service.getPairInfo(input);

      expect(result.id).toBe('s1');
      expect(result.groupsList[0].groupCode).toBe('IP-21');
      expect(result.teachersList[0].name).toBe('Ivanov');
    });

    it('should throw if pair not found', async () => {
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);
      await expect(service.getPairInfo({ id: 's1' })).rejects.toThrow(RpcException);
    });
  });

  describe('swapGroupPairs', () => {
    const sourceLoc: SwapGroupLocationDto = {
      groupId: 'g1',
      weekNumber: WeekNumber.FIRST,
      dayNumber: DayNumber.MONDAY,
      pairNumber: PairNumber.FIRST
    };
    const destLoc: SwapGroupLocationDto = {
      groupId: 'g1',
      weekNumber: WeekNumber.FIRST,
      dayNumber: DayNumber.MONDAY,
      pairNumber: PairNumber.SECOND
    };
    const input: SwapGroupPairsDto = {
      semester: SemesterNumber.FIRST,
      source: sourceLoc,
      destination: destLoc
    };

    it('should swap pairs successfully within transaction', async () => {
        const sourcePair = {
            id: 's1',
            teachersList: [],
            groupsList: ['g1'],
            semesterNumber: SemesterNumber.FIRST,
            weekNumber: WeekNumber.FIRST,
            dayNumber: DayNumber.MONDAY,
            pairNumber: PairNumber.FIRST
        };
        const destPair = {
            id: 'd1',
            teachersList: [],
            groupsList: ['g1'],
            semesterNumber: SemesterNumber.FIRST,
            weekNumber: WeekNumber.FIRST,
            dayNumber: DayNumber.MONDAY,
            pairNumber: PairNumber.SECOND
        };

        (mockQueryBuilder.getOne as jest.Mock)
            .mockResolvedValueOnce(sourcePair)
            .mockResolvedValueOnce(destPair);

        (mockEntityManager.create as jest.Mock).mockImplementation((entity, dto) => dto);

        await service.swapGroupPairs(input);

        expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
        expect(mockQueryRunner.startTransaction).toHaveBeenCalled();

        expect(mockEntityManager.delete).toHaveBeenCalledWith(Schedule, { id: 's1' });
        expect(mockEntityManager.delete).toHaveBeenCalledWith(Schedule, { id: 'd1' });
        expect(mockEntityManager.save).toHaveBeenCalledTimes(2);

        expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
        expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should do nothing if both source and destination pairs are missing', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);

        await service.swapGroupPairs(input);

        expect(mockEntityManager.delete).not.toHaveBeenCalled();
        expect(mockEntityManager.save).not.toHaveBeenCalled();
        expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
        (mockQueryBuilder.getOne as jest.Mock).mockRejectedValue(new Error('DB Error'));

        await expect(service.swapGroupPairs(input)).rejects.toThrow(RpcException);

        expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('swapTeacherPairs', () => {
    const sourceLoc: SwapTeacherLocationDto = {
      teacherId: 't1',
      weekNumber: WeekNumber.FIRST,
      dayNumber: DayNumber.MONDAY,
      pairNumber: PairNumber.FIRST
    };
    const destLoc: SwapTeacherLocationDto = {
      teacherId: 't1',
      weekNumber: WeekNumber.FIRST,
      dayNumber: DayNumber.MONDAY,
      pairNumber: PairNumber.SECOND
    };
    const input: SwapTeacherPairsDto = {
      semester: SemesterNumber.FIRST,
      source: sourceLoc,
      destination: destLoc
    };

    it('should swap teacher pairs successfully', async () => {
        const sourcePair = { id: 's1', teachersList: ['t1'], groupsList: [] };
        (mockQueryBuilder.getOne as jest.Mock)
            .mockResolvedValueOnce(sourcePair)
            .mockResolvedValueOnce(null);

        (mockEntityManager.create as jest.Mock).mockImplementation((e, d) => d);

        await service.swapTeacherPairs(input);

        expect(mockEntityManager.delete).toHaveBeenCalledWith(Schedule, { id: 's1' });
        expect(mockEntityManager.save).toHaveBeenCalledTimes(1);
        expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('updateGroups', () => {
    it('should increment groups course and delete graduated ones', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));

      const input: UpdateGroupsDto = { action: 1 };

      const groups = [
        { id: 'g1', groupCode: 'IP-31' },
        { id: 'g2', groupCode: 'IP-41' },
        { id: 'g3', groupCode: 'InvalidCode' }
      ] as unknown as Group[];

      groupRepo.find?.mockResolvedValue(groups);
      (mockEntityManager.find as jest.Mock).mockResolvedValue([]);

      await service.updateGroups(input);

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();

      expect(mockEntityManager.update).toHaveBeenCalledWith(Group, 'g1', { groupCode: 'IP-41' });

      expect(mockEntityManager.delete).toHaveBeenCalledWith(Group, { id: expect.arrayContaining(['g2']) });

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback on error during updateGroups', async () => {
      groupRepo.find?.mockRejectedValue(new Error('DB Fail'));

      await expect(service.updateGroups({ action: 1 })).rejects.toThrow(RpcException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
