import { Test, TestingModule } from '@nestjs/testing';
import { TeacherService } from './teacher.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Teacher } from '../entities/Teacher.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import { DataSource, Repository, EntityManager, SelectQueryBuilder } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateTeacherInput, UpdateTeacherInput } from '../dto/admin/teacher.dto';
import { SearchTeacherInput } from '../dto/public/search-teacher.dto';
import { TeacherPost } from '../types/TeacherPost.enum';

type MockRepository<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = unknown>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsBy: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockEntityManager = {
  findOneBy: jest.fn(),
  save: jest.fn(),
} as unknown as EntityManager;

const mockDataSource = {
  transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn(),
} as unknown as SelectQueryBuilder<Curriculum>;

describe('TeacherService', () => {
  let service: TeacherService;
  let teacherRepo: MockRepository<Teacher>;
  let curriculumRepo: MockRepository<Curriculum>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        {
          provide: getRepositoryToken(Teacher),
          useValue: createMockRepository<Teacher>(),
        },
        {
          provide: getRepositoryToken(Curriculum),
          useValue: createMockRepository<Curriculum>(),
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
    teacherRepo = module.get(getRepositoryToken(Teacher));
    curriculumRepo = module.get(getRepositoryToken(Curriculum));

    (curriculumRepo.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTeacher', () => {
    const createInput: CreateTeacherInput = {
      fullName: 'Ivanov I.I.',
      post: TeacherPost.DOCENT,
      department: 'Software Engineering',
    };

    it('should create a teacher successfully', async () => {
      const newTeacher = { id: '1', ...createInput } as unknown as Teacher;
      teacherRepo.create?.mockReturnValue(newTeacher);
      teacherRepo.save?.mockResolvedValue(newTeacher);

      await service.createTeacher(createInput);

      expect(teacherRepo.create).toHaveBeenCalledWith(createInput);
      expect(teacherRepo.save).toHaveBeenCalledWith(newTeacher);
    });
  });

  describe('findAllTeachers', () => {
    it('should return a response with teachers array', async () => {
      const teachers = [
        { id: '1', fullName: 'T1' } as unknown as Teacher,
        { id: '2', fullName: 'T2' } as unknown as Teacher,
      ];
      teacherRepo.find?.mockResolvedValue(teachers);

      const result = await service.findAllTeachers();

      expect(teacherRepo.find).toHaveBeenCalled();
      expect(result).toEqual({ teachers });
    });
  });

  describe('searchTeacher', () => {
    it('should return teachers matching criteria', async () => {
      const searchInput: SearchTeacherInput = { fullName: 'Ivan' };
      const teachers = [
        { id: '1', fullName: 'Ivanov', post: TeacherPost.DOCENT } as unknown as Teacher
      ];

      teacherRepo.find?.mockResolvedValue(teachers);

      const result = await service.searchTeacher(searchInput);

      expect(teacherRepo.find).toHaveBeenCalled();
      expect(result.teachers).toHaveLength(1);
      expect(result.teachers[0].fullName).toBe('Ivanov');
    });
  });

  describe('existsById', () => {
    it('should return true if teacher exists', async () => {
      teacherRepo.existsBy?.mockResolvedValue(true);

      const result = await service.existsById('1');

      expect(teacherRepo.existsBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toBe(true);
    });

    it('should return false if teacher does not exist', async () => {
      teacherRepo.existsBy?.mockResolvedValue(false);

      const result = await service.existsById('999');

      expect(teacherRepo.existsBy).toHaveBeenCalledWith({ id: '999' });
      expect(result).toBe(false);
    });
  });

  describe('updateTeacher', () => {
    const updateInput: UpdateTeacherInput = {
      fullName: 'Petrov P.P.',
      post: TeacherPost.PROFESSOR,
    };

    it('should update teacher successfully using transaction', async () => {
      const existingTeacher = { id: '1', fullName: 'Ivanov I.I.', post: TeacherPost.DOCENT } as unknown as Teacher;

      (mockEntityManager.findOneBy as jest.Mock).mockResolvedValue(existingTeacher);
      (mockEntityManager.save as jest.Mock).mockResolvedValue({ ...existingTeacher, ...updateInput });

      await service.updateTeacher('1', updateInput);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(Teacher, { id: '1' });
      expect(existingTeacher.fullName).toBe('Petrov P.P.');
      expect(mockEntityManager.save).toHaveBeenCalledWith(Teacher, existingTeacher);
    });

    it('should throw RpcException if teacher to update not found', async () => {
      (mockEntityManager.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.updateTeacher('999', updateInput)).rejects.toThrow(RpcException);
    });
  });

  describe('deleteTeacher', () => {
    it('should delete teacher successfully if no dependencies', async () => {
      const teacher = { id: '1' } as unknown as Teacher;
      teacherRepo.findOneBy?.mockResolvedValue(teacher);

      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null); 

      teacherRepo.delete?.mockResolvedValue({ affected: 1 });

      await service.deleteTeacher('1');

      expect(teacherRepo.delete).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw RpcException if teacher to delete not found', async () => {
      teacherRepo.findOneBy?.mockResolvedValue(null);

      await expect(service.deleteTeacher('999')).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if teacher is used in a curriculum', async () => {
      const teacher = { id: '1' } as unknown as Teacher;
      teacherRepo.findOneBy?.mockResolvedValue(teacher);

      const curriculum = { id: 'c1', subjectName: 'Physics' } as unknown as Curriculum;
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(curriculum);

      await expect(service.deleteTeacher('1')).rejects.toThrow(RpcException);
      await expect(service.deleteTeacher('1')).rejects.toMatchObject({
        message: expect.stringContaining('referenced in curriculum'),
      });
    });
  });
});
