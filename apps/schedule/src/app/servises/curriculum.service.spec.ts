import { Test, TestingModule } from '@nestjs/testing';
import { CurriculumService } from './curriculum.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Curriculum } from '../entities/Curriculum.entity';
import { Schedule } from '../entities/Schedule.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Group } from '../entities/Group.entity';
import { TeacherService } from './teacher.service';
import { GroupService } from './group.service';
import { DataSource, Repository, EntityManager, SelectQueryBuilder } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CurriculumInput } from '../dto/admin/curriculum.dto';

type MockRepository<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = unknown>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsBy: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockEntityManager = {
  create: jest.fn(),
  save: jest.fn(),
} as unknown as EntityManager;

const mockDataSource = {
  transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
};

const mockScheduleQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([]),
  getOne: jest.fn().mockResolvedValue(null),
} as unknown as SelectQueryBuilder<Schedule>;

const mockTeacherService = { existsById: jest.fn() };
const mockGroupService = { existsById: jest.fn() };

describe('CurriculumService', () => {
  let service: CurriculumService;
  let curriculumRepo: MockRepository<Curriculum>;
  let scheduleRepo: MockRepository<Schedule>;
  let teacherRepo: MockRepository<Teacher>;
  let groupRepo: MockRepository<Group>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumService,
        { provide: getRepositoryToken(Curriculum), useValue: createMockRepository<Curriculum>() },
        { provide: getRepositoryToken(Schedule), useValue: createMockRepository<Schedule>() },
        { provide: getRepositoryToken(Teacher), useValue: createMockRepository<Teacher>() },
        { provide: getRepositoryToken(Group), useValue: createMockRepository<Group>() },
        { provide: DataSource, useValue: mockDataSource },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: GroupService, useValue: mockGroupService },
      ],
    }).compile();

    service = module.get<CurriculumService>(CurriculumService);
    curriculumRepo = module.get(getRepositoryToken(Curriculum));
    scheduleRepo = module.get(getRepositoryToken(Schedule));
    teacherRepo = module.get(getRepositoryToken(Teacher));
    groupRepo = module.get(getRepositoryToken(Group));

    (scheduleRepo.createQueryBuilder as jest.Mock).mockReturnValue(mockScheduleQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCurriculums', () => {
    it('should return mapped curriculums with teacher and group names', async () => {
      const curriculums = [
        {
          id: 'c1',
          subjectName: 'Math',
          relatedTeachers: [{ id: 't1' }],
          relatedGroups: [{ id: 'g1' }],
        },
      ] as unknown as Curriculum[];
      curriculumRepo.find?.mockResolvedValue(curriculums);

      teacherRepo.findBy?.mockResolvedValue([{ id: 't1', fullName: 'T. Name' }]);
      groupRepo.findBy?.mockResolvedValue([{ id: 'g1', groupCode: 'G-Code' }]);

      const result = await service.findAllCurriculums();

      expect(result.curriculums[0].subjectName).toBe('Math');
      expect(result.curriculums[0].relatedTeachers[0].name).toBe('T. Name');
      expect(result.curriculums[0].relatedGroups[0].code).toBe('G-Code');
    });
  });

  describe('findOneById', () => {
    it('should return a curriculum if found', async () => {
      const curriculum = { id: 'c1', subjectName: 'Math' } as unknown as Curriculum;
      curriculumRepo.findOneBy?.mockResolvedValue(curriculum);

      const result = await service.findOneById('c1');

      expect(curriculumRepo.findOneBy).toHaveBeenCalledWith({ id: 'c1' });
      expect(result).toEqual(curriculum);
    });

    it('should return null if curriculum not found', async () => {
      curriculumRepo.findOneBy?.mockResolvedValue(null);

      const result = await service.findOneById('non-existent-id');

      expect(curriculumRepo.findOneBy).toHaveBeenCalledWith({ id: 'non-existent-id' });
      expect(result).toBeNull();
    });
  });

  describe('createCurriculum', () => {
    const input: CurriculumInput = {
      subjectName: 'New Subject',
      relatedTeachers: [{
        id: 't1',
        plannedLectures: 10,
        plannedPracticals: 0,
        plannedLabs: 0
      }],
      relatedGroups: [],
    };

    it('should create curriculum successfully', async () => {
      curriculumRepo.existsBy?.mockResolvedValue(false);
      mockTeacherService.existsById.mockResolvedValue(true);

      const createdCurriculum = { id: 'new-id', ...input } as unknown as Curriculum;
      (mockEntityManager.create as jest.Mock).mockReturnValue(createdCurriculum);
      (mockEntityManager.save as jest.Mock).mockResolvedValue(createdCurriculum);

      (mockScheduleQueryBuilder.getMany as jest.Mock).mockResolvedValue([]);

      await service.createCurriculum(input);

      expect(curriculumRepo.existsBy).toHaveBeenCalledWith({ subjectName: input.subjectName });
      expect(mockTeacherService.existsById).toHaveBeenCalledWith('t1');
      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalledTimes(2);
    });

    it('should throw RpcException if subject name exists', async () => {
      curriculumRepo.existsBy?.mockResolvedValue(true);

      await expect(service.createCurriculum(input)).rejects.toThrow(RpcException);
      await expect(service.createCurriculum(input)).rejects.toMatchObject({
        message: expect.stringContaining('already exists'),
      });
    });

    it('should throw RpcException if teacher not found', async () => {
      curriculumRepo.existsBy?.mockResolvedValue(false);
      mockTeacherService.existsById.mockResolvedValue(false);

      await expect(service.createCurriculum(input)).rejects.toThrow(RpcException);
      await expect(service.createCurriculum(input)).rejects.toMatchObject({
        message: expect.stringContaining('Teacher with ID t1 not found'),
      });
    });
  });

  describe('updateCurriculum', () => {
    const input: CurriculumInput = {
      subjectName: 'Updated Math',
      relatedTeachers: [],
      relatedGroups: [],
    };

    it('should update curriculum successfully', async () => {
      const existingCurriculum = {
        id: 'c1',
        subjectName: 'Math',
        relatedTeachers: [],
        relatedGroups: [],
      } as unknown as Curriculum;

      curriculumRepo.findOneBy?.mockResolvedValue(existingCurriculum);
      curriculumRepo.save?.mockResolvedValue({ ...existingCurriculum, ...input });

      await service.updateCurriculum('c1', input);

      expect(curriculumRepo.save).toHaveBeenCalled();
      expect(existingCurriculum.subjectName).toBe('Updated Math');
    });

    it('should throw exception if removing a teacher with scheduled hours', async () => {
      const updateInput: CurriculumInput = {
        subjectName: 'Math',
        relatedTeachers: [],
        relatedGroups: [],
      };

      const existingCurriculum = {
        id: 'c1',
        relatedTeachers: [{
          id: 't1',
          scheduledLectures: 2,
        }],
        relatedGroups: [],
      } as unknown as Curriculum;

      curriculumRepo.findOneBy?.mockResolvedValue(existingCurriculum);

      await expect(service.updateCurriculum('c1', updateInput)).rejects.toThrow(RpcException);
      await expect(service.updateCurriculum('c1', updateInput)).rejects.toMatchObject({
        message: expect.stringContaining('Cannot remove teacher'),
      });
    });
  });

  describe('checkCorrespondence', () => {
    it('should return true if planned equals scheduled', () => {
      const curriculum = {
        relatedTeachers: [{
          plannedLectures: 10, scheduledLectures: 10,
          plannedPracticals: 5, scheduledPracticals: 5,
          plannedLabs: 0, scheduledLabs: 0
        }],
        relatedGroups: []
      } as unknown as Curriculum;

      const result = service.checkCorrespondence(curriculum);
      expect(result).toBe(true);
    });

    it('should return false if planned does not equal scheduled', () => {
      const curriculum = {
        relatedTeachers: [{
          plannedLectures: 10, scheduledLectures: 8,
          plannedPracticals: 5, scheduledPracticals: 5,
          plannedLabs: 0, scheduledLabs: 0
        }],
        relatedGroups: []
      } as unknown as Curriculum;

      const result = service.checkCorrespondence(curriculum);
      expect(result).toBe(false);
    });
  });

  describe('deleteCurriculum', () => {
    it('should delete if no dependencies in schedule', async () => {
      const curriculum = { id: 'c1' } as unknown as Curriculum;
      curriculumRepo.findOneBy?.mockResolvedValue(curriculum);

      scheduleRepo.findOneBy?.mockResolvedValue(null);

      curriculumRepo.delete?.mockResolvedValue({ affected: 1 });

      await service.deleteCurriculum('c1');

      expect(curriculumRepo.delete).toHaveBeenCalledWith('c1');
    });

    it('should throw if referenced in schedule', async () => {
      const curriculum = { id: 'c1' } as unknown as Curriculum;
      curriculumRepo.findOneBy?.mockResolvedValue(curriculum);

      scheduleRepo.findOneBy?.mockResolvedValue({ id: 's1' });

      await expect(service.deleteCurriculum('c1')).rejects.toThrow(RpcException);
    });
  });

  describe('calculateScheduledHours (via processCurriculumRelations)', () => {

    it('should count lectures correctly', async () => {
      const curriculum = {
        id: 'c1',
        relatedTeachers: [{ id: 't1', plannedLectures: 2 }],
        relatedGroups: []
      } as unknown as Curriculum;

      curriculumRepo.findOneBy?.mockResolvedValue(curriculum);

      (mockScheduleQueryBuilder.getMany as jest.Mock).mockResolvedValue([
        { lessonType: 'Lecture' },
        { lessonType: 'Lecture' },
      ]);

      await service.recalculateCurriculumCorrespondence('c1');

      expect(curriculumRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        relatedTeachers: expect.arrayContaining([
          expect.objectContaining({
            scheduledLectures: 2
          })
        ])
      }));
    });
  });
});
