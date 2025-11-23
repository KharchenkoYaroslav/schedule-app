import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Curriculum } from '../entities/Curriculum.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Group } from '../entities/Group.entity';
import { TeacherService } from './teacher.service';
import { GroupService } from './group.service';
import { Schedule } from '../entities/Schedule.entity';
import {
  FindAllCurriculumsResponse,
  CurriculumDto,
  RelatedTeacherDto,
  RelatedGroupDto,
  CurriculumInput,
  RelatedTeacher,
  RelatedGroup
} from '../dto/admin/curriculum.dto';

@Injectable()
export class CurriculumService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Curriculum)
    private readonly curriculumRepository: Repository<Curriculum>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,

    private readonly teacherService: TeacherService,
    private readonly groupService: GroupService
  ) {}

  // Приватні методи для розрахунків

  private async validateRelations(
    input: CurriculumInput
  ): Promise<void> {
    if (input.relatedTeachers) {
      const validTeachers = input.relatedTeachers.filter((t) => t.id);
      for (const teacherInput of validTeachers) {
        const teacherExists = await this.teacherService.existsById(teacherInput.id);
        if (!teacherExists) {
          throw new RpcException({
            message: `Teacher with ID ${teacherInput.id} not found`,
            code: 5,
          });
        }
      }
    }

    if (input.relatedGroups) {
      const validGroups = input.relatedGroups.filter((g) => g.id);
      for (const groupInput of validGroups) {
        const groupExists = await this.groupService.existsById(groupInput.id);
        if (!groupExists) {
          throw new RpcException({
            message: `Group with ID ${groupInput.id} not found`,
            code: 5,
          });
        }
      }
    }
  }

  private async calculateScheduledHours(
    curriculumId: string,
    teacherId?: string,
    groupId?: string
  ): Promise<{ lectures: number; practicals: number; labs: number }> {
    const baseQuery = this.scheduleRepository
      .createQueryBuilder('s')
      .where('s.subjectId = :curriculumId', { curriculumId });

    if (teacherId) {
      baseQuery.andWhere(
        's.teachers_list @> :teacherJson',
        {
          teacherJson: JSON.stringify([teacherId]),
        }
      );
    }

    if (groupId) {
      baseQuery.andWhere('s.groups_list @> :groupJson', {
        groupJson: JSON.stringify([groupId]),
      });
    }

    const schedules = await baseQuery.getMany();

    let lectures = 0;
    let practicals = 0;
    let labs = 0;

    for (const schedule of schedules) {
      switch (schedule.lessonType) {
        case 'Lecture':
          lectures++;
          break;
        case 'Practice':
          practicals++;
          break;
        case 'Laboratory':
          labs++;
          break;
      }
    }
    return { lectures, practicals, labs };
  }

  private async processCurriculumRelations(
    curriculumId: string,
    input: CurriculumInput
  ): Promise<{
    relatedTeachers: RelatedTeacher[];
    relatedGroups: RelatedGroup[];
  }> {
    const processedTeachers: RelatedTeacher[] = [];
    const processedGroups: RelatedGroup[] = [];

    if (input.relatedTeachers) {
      const validTeachers = input.relatedTeachers.filter((t) => t.id);
      for (const teacherInput of validTeachers) {
        const scheduled = await this.calculateScheduledHours(
          curriculumId,
          teacherInput.id
        );

        processedTeachers.push({
          id: teacherInput.id,
          plannedLectures: teacherInput.plannedLectures,
          plannedPracticals: teacherInput.plannedPracticals,
          plannedLabs: teacherInput.plannedLabs,
          scheduledLectures: scheduled.lectures,
          scheduledPracticals: scheduled.practicals,
          scheduledLabs: scheduled.labs,
        });
      }
    }

    if (input.relatedGroups) {
      const validGroups = input.relatedGroups.filter((g) => g.id);
      for (const groupInput of validGroups) {
        const scheduled = await this.calculateScheduledHours(
          curriculumId,
          undefined,
          groupInput.id
        );

        processedGroups.push({
          id: groupInput.id,
          plannedLectures: groupInput.plannedLectures,
          plannedPracticals: groupInput.plannedPracticals,
          plannedLabs: groupInput.plannedLabs,
          scheduledLectures: scheduled.lectures,
          scheduledPracticals: scheduled.practicals,
          scheduledLabs: scheduled.labs,
        });
      }
    }

    return {
      relatedTeachers: processedTeachers,
      relatedGroups: processedGroups,
    };
  }

  public checkCorrespondence(curriculum: Curriculum): boolean {
    const checkHours = (item: RelatedTeacher | RelatedGroup) =>
      item.plannedLectures === item.scheduledLectures &&
      item.plannedPracticals === item.scheduledPracticals &&
      item.plannedLabs === item.scheduledLabs;

    const teachersMatch = curriculum.relatedTeachers.every(checkHours);
    const groupsMatch = curriculum.relatedGroups.every(checkHours);

    return teachersMatch && groupsMatch;
  }

  private async mapCurriculumToDto(
    curriculums: Curriculum[],
  ): Promise<CurriculumDto[]> {
    const allTeacherIds = new Set<string>();
    const allGroupIds = new Set<string>();

    curriculums.forEach((c) => {
      c.relatedTeachers.forEach((t) => allTeacherIds.add(t.id));
      c.relatedGroups.forEach((g) => allGroupIds.add(g.id));
    });

    const teachers = await this.teacherRepository.findBy({
      id: In(Array.from(allTeacherIds)),
    });
    const groups = await this.groupRepository.findBy({
      id: In(Array.from(allGroupIds)),
    });

    const teacherMap = new Map(
      teachers.map((t) => [t.id, t.fullName]),
    );
    const groupMap = new Map(
      groups.map((g) => [g.id, g.groupCode]),
    );

    return curriculums.map((curriculum) => {
      const relatedTeachersDto: RelatedTeacherDto[] = curriculum.relatedTeachers.map(
        (t) => ({
          ...t,
          name: teacherMap.get(t.id) || 'Unknown Teacher',
        }),
      );

      const relatedGroupsDto: RelatedGroupDto[] = curriculum.relatedGroups.map(
        (g) => ({
          ...g,
          code: groupMap.get(g.id) || 'Unknown Group',
        }),
      );

      return {
        ...curriculum,
        relatedTeachers: relatedTeachersDto,
        relatedGroups: relatedGroupsDto,
      } as CurriculumDto;
    });
  }

  async findAllCurriculums(): Promise<FindAllCurriculumsResponse> {
    const curriculums = await this.curriculumRepository.find();

    const curriculumsDto = await this.mapCurriculumToDto(curriculums);

    return { curriculums: curriculumsDto };
  }

  async findOneById(curriculumId: string): Promise<Curriculum | null> {
    return this.curriculumRepository.findOneBy({ id: curriculumId });
  }

  async createCurriculum(input: CurriculumInput): Promise<void> {
    const existingCurriculum = await this.curriculumRepository.existsBy({
      subjectName: input.subjectName,
    });

    if (existingCurriculum) {
      throw new RpcException({
        message: `Curriculum with subject name ${input.subjectName} already exists`,
        code: 6,
      });
    }

    await this.validateRelations(input);

    await this.dataSource.transaction(async (entityManager) => {
      const newCurriculum = entityManager.create(Curriculum, {
        subjectName: input.subjectName,
      });

      const savedCurriculum = await entityManager.save(Curriculum, newCurriculum);

      const { relatedTeachers, relatedGroups } =
        await this.processCurriculumRelations(savedCurriculum.id, input);

      savedCurriculum.relatedTeachers = relatedTeachers;
      savedCurriculum.relatedGroups = relatedGroups;

      savedCurriculum.correspondence = this.checkCorrespondence(savedCurriculum);

      await entityManager.save(Curriculum, savedCurriculum);
    });
  }

  async updateCurriculum(
    curriculumId: string,
    input: CurriculumInput
  ): Promise<void> {
    if (input.relatedTeachers || input.relatedGroups) {
      await this.validateRelations(input);
    }

    const curriculum = await this.curriculumRepository.findOneBy({
      id: curriculumId,
    });

    if (!curriculum) {
      throw new RpcException({
        message: `Curriculum with ID ${curriculumId} not found`,
        code: 5,
      });
    }

    if (input.subjectName !== undefined) {
      curriculum.subjectName = input.subjectName;
    }

    if (input.relatedTeachers || input.relatedGroups) {
      if (input.relatedTeachers) {
        const newTeacherIds = new Set(input.relatedTeachers.map((t) => t.id));
        const removedTeachers = curriculum.relatedTeachers.filter(
          (t) => !newTeacherIds.has(t.id)
        );

        for (const teacher of removedTeachers) {
          if (
            teacher.scheduledLectures > 0 ||
            teacher.scheduledPracticals > 0 ||
            teacher.scheduledLabs > 0
          ) {
            throw new RpcException({
              message: `Cannot remove teacher with ID ${teacher.id}. They have scheduled hours in this curriculum.`,
              code: 6,
            });
          }
        }
      }

      if (input.relatedGroups) {
        const newGroupIds = new Set(input.relatedGroups.map((g) => g.id));
        const removedGroups = curriculum.relatedGroups.filter(
          (g) => !newGroupIds.has(g.id)
        );

        for (const group of removedGroups) {
          if (
            group.scheduledLectures > 0 ||
            group.scheduledPracticals > 0 ||
            group.scheduledLabs > 0
          ) {
            throw new RpcException({
              message: `Cannot remove group with ID ${group.id}. It has scheduled hours in this curriculum.`,
              code: 6,
            });
          }
        }
      }

      const { relatedTeachers, relatedGroups } =
        await this.processCurriculumRelations(curriculumId, input);

      if (input.relatedTeachers) {
        curriculum.relatedTeachers = relatedTeachers;
      }
      if (input.relatedGroups) {
        curriculum.relatedGroups = relatedGroups;
      }
    }

    curriculum.correspondence = this.checkCorrespondence(curriculum);

    await this.curriculumRepository.save(curriculum);
  }

  public async recalculateCurriculumCorrespondence(
    curriculumId: string,
  ): Promise<void> {
    const curriculum = await this.curriculumRepository.findOneBy({
      id: curriculumId,
    });

    if (!curriculum) {
      return;
    }

    const input: CurriculumInput = {
      relatedTeachers: curriculum.relatedTeachers,
      relatedGroups: curriculum.relatedGroups,
      subjectName: ''
    };

    const { relatedTeachers, relatedGroups } =
      await this.processCurriculumRelations(curriculumId, input);

    curriculum.relatedTeachers = relatedTeachers;
    curriculum.relatedGroups = relatedGroups;
    curriculum.correspondence = this.checkCorrespondence(curriculum);

    await this.curriculumRepository.save(curriculum);
  }

  async deleteCurriculum(curriculumId: string): Promise<void> {
    const curriculum = await this.curriculumRepository.findOneBy({
      id: curriculumId,
    });

    if (!curriculum) {
      throw new RpcException({
        message: `Curriculum with ID ${curriculumId} not found`,
        code: 5,
      });
    }

    const scheduleDependency = await this.scheduleRepository.findOneBy({
      subjectId: curriculumId,
    });

    if (scheduleDependency) {
      throw new RpcException({
        message: `Cannot delete curriculum with ID ${curriculumId}. It is referenced in schedule (ID: ${scheduleDependency.id})`,
        code: 6,
      });
    }

    await this.curriculumRepository.delete(curriculumId);
  }
}
