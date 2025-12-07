import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from '../entities/Group.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import { DataSource, Repository, EntityManager, SelectQueryBuilder } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { CreateGroupInput, UpdateGroupInput } from '../dto/admin/group.dto';
import { SearchGroupInput } from '../dto/public/search-group.dto';

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

describe('GroupService', () => {
  let service: GroupService;
  let groupRepo: MockRepository<Group>;
  let curriculumRepo: MockRepository<Curriculum>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(Group),
          useValue: createMockRepository<Group>(),
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

    service = module.get<GroupService>(GroupService);
    groupRepo = module.get(getRepositoryToken(Group));
    curriculumRepo = module.get(getRepositoryToken(Curriculum));

    (curriculumRepo.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroup', () => {
    const createInput: CreateGroupInput = {
      groupCode: 'IPZ-21',
      faculty: 'FICT',
    };

    it('should create a group successfully', async () => {
      groupRepo.existsBy?.mockResolvedValue(false);

      const newGroup = { id: '1', ...createInput } as unknown as Group;
      groupRepo.create?.mockReturnValue(newGroup);
      groupRepo.save?.mockResolvedValue(newGroup);

      await service.createGroup(createInput);

      expect(groupRepo.existsBy).toHaveBeenCalledWith({ groupCode: createInput.groupCode });
      expect(groupRepo.save).toHaveBeenCalledWith(newGroup);
    });

    it('should throw RpcException if group code already exists', async () => {
      groupRepo.existsBy?.mockResolvedValue(true);

      await expect(service.createGroup(createInput)).rejects.toThrow(RpcException);
      await expect(service.createGroup(createInput)).rejects.toMatchObject({
        message: expect.stringContaining('already exists'),
      });
    });
  });

  describe('searchGroup', () => {
    it('should return groups matching the search criteria', async () => {
      const searchInput: SearchGroupInput = { groupCode: 'IP' };
      const foundGroups = [
        { id: '1', groupCode: 'IP-21' } as unknown as Group,
        { id: '2', groupCode: 'IP-22' } as unknown as Group,
      ];

      groupRepo.find?.mockResolvedValue(foundGroups);

      const result = await service.searchGroup(searchInput);

      expect(groupRepo.find).toHaveBeenCalled();
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].groupCode).toBe('IP-21');
      expect(result.groups[1].groupCode).toBe('IP-22');
    });
  });

  describe('findAllGroups', () => {
    it('should return a response with groups array', async () => {
      const groups = [
        { id: '1', groupCode: 'G1' } as unknown as Group,
        { id: '2', groupCode: 'G2' } as unknown as Group,
      ];
      groupRepo.find?.mockResolvedValue(groups);

      const result = await service.findAllGroups();

      expect(groupRepo.find).toHaveBeenCalled();
      expect(result).toEqual({ groups });
    });
  });

  describe('existsById', () => {
    it('should return true if group exists', async () => {
      groupRepo.existsBy?.mockResolvedValue(true);

      const result = await service.existsById('group-id-1');

      expect(groupRepo.existsBy).toHaveBeenCalledWith({ id: 'group-id-1' });
      expect(result).toBe(true);
    });

    it('should return false if group does not exist', async () => {
      groupRepo.existsBy?.mockResolvedValue(false);

      const result = await service.existsById('non-existent-id');

      expect(groupRepo.existsBy).toHaveBeenCalledWith({ id: 'non-existent-id' });
      expect(result).toBe(false);
    });
  });

  describe('updateGroup', () => {
    const updateInput: UpdateGroupInput = {
      groupCode: 'IPZ-NEW',
      faculty: 'FICT',
    };

    it('should update group successfully using transaction', async () => {
      const existingGroup = { id: '1', groupCode: 'IPZ-OLD', faculty: 'OLD' } as unknown as Group;

      (mockEntityManager.findOneBy as jest.Mock).mockImplementation(async (entity, criteria) => {
        if (criteria.id === '1') return existingGroup;
        if (criteria.groupCode === 'IPZ-NEW') return null;
        return null;
      });

      (mockEntityManager.save as jest.Mock).mockResolvedValue({ ...existingGroup, ...updateInput });

      await service.updateGroup('1', updateInput);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockEntityManager.findOneBy).toHaveBeenCalledTimes(2);
      expect(existingGroup.groupCode).toBe('IPZ-NEW');
      expect(mockEntityManager.save).toHaveBeenCalledWith(Group, existingGroup);
    });

    it('should throw RpcException if group to update not found', async () => {
      (mockEntityManager.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.updateGroup('999', updateInput)).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if new group code conflicts with another group', async () => {
      const existingGroup = { id: '1', groupCode: 'IPZ-OLD' } as unknown as Group;
      const conflictGroup = { id: '2', groupCode: 'IPZ-NEW' } as unknown as Group;

      (mockEntityManager.findOneBy as jest.Mock).mockImplementation(async (entity, criteria) => {
        if (criteria.id === '1') return existingGroup;
        if (criteria.groupCode === 'IPZ-NEW') return conflictGroup; 
        return null;
      });

      await expect(service.updateGroup('1', updateInput)).rejects.toThrow(RpcException);
      await expect(service.updateGroup('1', updateInput)).rejects.toMatchObject({
        message: expect.stringContaining('already exists'),
      });
    });
  });

  describe('deleteGroup', () => {
    it('should delete group successfully if no dependencies', async () => {
      const group = { id: '1' } as unknown as Group;
      groupRepo.findOneBy?.mockResolvedValue(group);

      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(null);
      groupRepo.delete?.mockResolvedValue({ affected: 1 });

      await service.deleteGroup('1');

      expect(groupRepo.delete).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw RpcException if group to delete not found', async () => {
      groupRepo.findOneBy?.mockResolvedValue(null);

      await expect(service.deleteGroup('999')).rejects.toThrow(RpcException);
    });

    it('should throw RpcException if group is used in a curriculum', async () => {
      const group = { id: '1' } as unknown as Group;
      groupRepo.findOneBy?.mockResolvedValue(group);

      const curriculum = { id: 'c1', subjectName: 'Math' } as unknown as Curriculum;
      (mockQueryBuilder.getOne as jest.Mock).mockResolvedValue(curriculum);

      await expect(service.deleteGroup('1')).rejects.toThrow(RpcException);
      await expect(service.deleteGroup('1')).rejects.toMatchObject({
        message: expect.stringContaining('referenced in curriculum'),
      });
    });
  });
});
