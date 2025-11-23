import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Group } from '../entities/Group.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import {
  SearchGroupInput,
  SearchGroupResponse,
} from '../dto/public/search-group.dto';
import {CreateGroupInput, UpdateGroupInput, FindAllGroupsResponse } from '../dto/admin/group.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Curriculum)
    private readonly curriculumRepository: Repository<Curriculum>,
  ) {}

  async searchGroup(input: SearchGroupInput): Promise<SearchGroupResponse> {
    const groups = await this.groupRepository.find({
      where: {
        groupCode: Like(`%${input.groupCode}%`),
      },
      select: ['id', 'groupCode', 'faculty'],
      take: 10,
    });

    return {
      groups: groups.map((g) => ({
        id: g.id,
        groupCode: g.groupCode,
        faculty: g.faculty,
      })),
    };
  }

  async findAllGroups(): Promise<FindAllGroupsResponse> {
    const groups = await this.groupRepository.find();

    return { groups };
  }

  async existsById(groupId: string): Promise<boolean> {
    return this.groupRepository.existsBy({ id: groupId });
  }

  async createGroup(input: CreateGroupInput): Promise<void> {
    const existingGroup = await this.groupRepository.existsBy({
      groupCode: input.groupCode,
    });

    if (existingGroup) {
      throw new RpcException({
        message: `Group with group code ${input.groupCode} already exists`,
        code: 6,
      });
    }

    const newGroup = this.groupRepository.create(input);

    await this.groupRepository.save(newGroup);
  }

  async updateGroup(
    id: string,
    input: UpdateGroupInput
  ): Promise<void> {
    return this.dataSource.transaction(async (entityManager) => {
      const group = await entityManager.findOneBy(Group, { id });

      if (!group) {
        throw new RpcException({
          message: `Group with ID ${id} not found`,
          code: 5,
        });
      }

      if (input.groupCode !== undefined) {
        group.groupCode = input.groupCode;
      }

      if (input.faculty !== undefined) {
        group.faculty = input.faculty;
      }

      await entityManager.save(Group, group);
    });
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.groupRepository.findOneBy({ id });

    if (!group) {
      throw new RpcException({
        message: `Group with ID ${id} not found`,
        code: 5,
      });
    }

    const curriculumDependency = await this.curriculumRepository
      .createQueryBuilder('c')
      .where('c.related_groups @> :groupIdJson', {
        groupIdJson: JSON.stringify([{ id }]),
      })
      .getOne();

    if (curriculumDependency) {
      throw new RpcException({
        message: `Cannot delete group with ID ${id}. It is referenced in curriculum: ${curriculumDependency.subjectName} (ID: ${curriculumDependency.id})`,
        code: 6,
      });
    }

    await this.groupRepository.delete({ id });
  }
}
