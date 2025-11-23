import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Schedule } from '../entities/Schedule.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Group } from '../entities/Group.entity';
import { CurriculumService } from './curriculum.service';
import { SemesterNumber } from '../types/SemesterNumber.enum';
import { WeekNumber } from '../types/WeekNumber.enum';
import { DayNumber } from '../types/DayNumber.enum';
import { PairNumber } from '../types/PairNumber.enum';
import {
  GetGroupScheduleInput,
  GetTeacherScheduleInput,
  ScheduleResponse,
} from '../dto/public/public-schedule.dto';
import {
  AddPairDto,
  EditPairDto,
  DeletePairDto,
  GetPairsByCriteriaDto,
  GetPairsByCriteriaResponse,
  GetPairsInfoDto,
  GetPairInfoResponse,
  SwapGroupPairsDto,
  SwapTeacherPairsDto,
  UpdateGroupsDto,
} from '../dto/admin/schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    private readonly dataSource: DataSource,
    private readonly curriculumService: CurriculumService
  ) {}

  async getGroupSchedule(
    input: GetGroupScheduleInput
  ): Promise<ScheduleResponse> {
    const schedules = await this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.subject', 'c')
      .where('s.groups_list @> :groupIdJson', {
        groupIdJson: JSON.stringify([input.groupId]),
      })
      .andWhere('s.semester_number = :semesterNumber', {
        semesterNumber: input.semesterNumber,
      })
      .getMany();

    if (schedules.length === 0) {
      return { schedule: [] };
    }

    const teacherIds = schedules.flatMap((s) => s.teachersList || []);
    const uniqueTeacherIds = [...new Set(teacherIds)];

    const teachersData = await this.teacherRepository.find({
      where: { id: In(uniqueTeacherIds) },
      select: ['id', 'fullName', 'post'],
    });
    const teacherMap = new Map(
      teachersData.map((t) => [t.id, { id: t.id, name: t.fullName, post: t.post }])
    );

    const scheduleItems = schedules.map((s) => {
      const teachersList = (s.teachersList || [])
        .map((tId) => teacherMap.get(tId))
        .filter((t) => t !== undefined);

      const [building, audienceNumber] = s.audience ? s.audience.split('-') : [undefined, undefined];

      return {
        weekNumber: Number(s.weekNumber),
        dayNumber: Number(s.dayNumber),
        pairNumber: Number(s.pairNumber),
        subjectName: s.subject.subjectName,
        lessonType: s.lessonType,
        visitFormat: s.visitFormat,
        teachersList: teachersList,
        ...(building && { building }),
        ...(audienceNumber && { audienceNumber }),
      };
    });

    return { schedule: scheduleItems };
  }

  async getTeacherSchedule(
    input: GetTeacherScheduleInput
  ): Promise<ScheduleResponse> {
    const schedules = await this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.subject', 'c')
      .where('s.teachers_list @> :teacherIdJson', {
        teacherIdJson: JSON.stringify([input.teacherId]),
      })
      .andWhere('s.semester_number = :semesterNumber', {
        semesterNumber: input.semesterNumber,
      })
      .getMany();

    if (schedules.length === 0) {
      return { schedule: [] };
    }

    const groupIds = schedules.flatMap((s) => s.groupsList || []);
    const uniqueGroupIds = [...new Set(groupIds)];

    const groupsData = await this.groupRepository.find({
      where: { id: In(uniqueGroupIds) },
      select: ['id', 'groupCode', 'faculty'],
    });
    const groupMap = new Map(
      groupsData.map((g) => [g.id, { id: g.id, groupCode: g.groupCode, faculty: g.faculty }])
    );

    const scheduleItems = schedules.map((s) => {
      const groupsList = (s.groupsList || [])
        .map((gId) => groupMap.get(gId))
        .filter((g) => g !== undefined);

      const [building, audienceNumber] = s.audience ? s.audience.split('-') : [undefined, undefined];

      return {
        weekNumber: Number(s.weekNumber),
        dayNumber: Number(s.dayNumber),
        pairNumber: Number(s.pairNumber),
        subjectName: s.subject.subjectName,
        lessonType: s.lessonType,
        visitFormat: s.visitFormat,
        groupsList: groupsList,
        ...(building && { building }),
        ...(audienceNumber && { audienceNumber }),
      };
    });

    return { schedule: scheduleItems };
  }

  async addPair(input: AddPairDto): Promise<void> {
    await this.validateCurriculumRelations(
      input.subjectId,
      input.teachersList,
      input.groupsList
    );

    await this.checkTeacherConflict(
      input.semesterNumber,
      input.weekNumber,
      input.dayNumber,
      input.pairNumber,
      input.teachersList
    );

    const newPair = this.scheduleRepository.create({
      ...input,
      audience: input.audience || null,
    });
    await this.scheduleRepository.save(newPair);

    await this.curriculumService.recalculateCurriculumCorrespondence(
      input.subjectId
    );
  }

  async editPair(input: EditPairDto): Promise<void> {
    const { id, ...updateData } = input;

    await this.validateCurriculumRelations(
      updateData.subjectId,
      updateData.teachersList,
      updateData.groupsList
    );

    await this.checkTeacherConflict(
      updateData.semesterNumber,
      updateData.weekNumber,
      updateData.dayNumber,
      updateData.pairNumber,
      updateData.teachersList,
      id
    );

    await this.scheduleRepository.update(id, {
      ...updateData,
      audience: updateData.audience || null,
    });

    await this.curriculumService.recalculateCurriculumCorrespondence(
      updateData.subjectId
    );
  }

  async deletePair(input: DeletePairDto): Promise<void> {
    const pairToDelete = await this.scheduleRepository.findOneBy({
      id: input.id,
    });

    if (!pairToDelete) {
      throw new RpcException({
        message: `Schedule pair with ID ${input.id} not found`,
        code: 5,
      });
    }

    await this.scheduleRepository.delete(input.id);

    await this.curriculumService.recalculateCurriculumCorrespondence(
      pairToDelete.subjectId
    );
  }

  async getPairsByCriteria(
    input: GetPairsByCriteriaDto
  ): Promise<GetPairsByCriteriaResponse> {
    const {
      semester,
      groupId,
      teacherId,
    } = input;

    const query = this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.subject', 'c')
      .where('s.semester_number = :semester', { semester })

    if (groupId) {
      query.andWhere('s.groups_list @> :groupJson', {
        groupJson: JSON.stringify([groupId]),
      });
    }

    if (teacherId) {
      query.andWhere('s.teachers_list @> :teacherJson', {
        teacherJson: JSON.stringify([teacherId]),
      });
    }

    const schedules = await query.getMany();

    const pairs = schedules.map((s) => ({
      id: s.id,
      subjectName: s.subject.subjectName,
      semesterNumber: s.semesterNumber,
      weekNumber: s.weekNumber,
      dayNumber: s.dayNumber,
      pairNumber: s.pairNumber,
    }));

    return { pairs };
  }

  async getPairInfo(input: GetPairsInfoDto): Promise<GetPairInfoResponse> {
    const pair = await this.scheduleRepository
      .createQueryBuilder('s')
      .select([
        's.id',
        's.groupsList',
        's.teachersList',
        's.lessonType',
        's.visitFormat',
        's.audience',
      ])
      .where('s.id = :id', { id: input.id })
      .getOne();

    if (!pair) {
      throw new RpcException({
        message: `Pair with id ${input.id} not found`,
        code: 5,
      });
    }

    const groupIds = pair.groupsList || [];
    const teacherIds = pair.teachersList || [];

    const groupsData = await this.groupRepository.find({
      where: { id: In(groupIds) },
      select: ['id', 'groupCode'],
    });

    const teachersData = await this.teacherRepository.find({
      where: { id: In(teacherIds) },
      select: ['id', 'fullName'],
    });

    const groupsList = groupsData.map((g) => ({
      id: g.id,
      groupCode: g.groupCode,
    }));

    const teachersList = teachersData.map((t) => ({
      id: t.id,
      name: t.fullName,
    }));

    return {
      id: pair.id,
      groupsList,
      teachersList,
      lessonType: pair.lessonType,
      visitFormat: pair.visitFormat,
      audience: pair.audience,
    };
  }

  async swapGroupPairs(input: SwapGroupPairsDto): Promise<void> {
    const { semester, source, destination } = input;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Знайти запис джерела
      const sourcePair = await queryRunner.manager
        .createQueryBuilder(Schedule, 's')
        .where('s.semester_number = :semester', { semester })
        .andWhere('s.week_number = :weekNumber', {
          weekNumber: source.weekNumber,
        })
        .andWhere('s.day_number = :dayNumber', { dayNumber: source.dayNumber })
        .andWhere('s.pair_number = :pairNumber', {
          pairNumber: source.pairNumber,
        })
        .andWhere('s.groups_list @> :groupIdJson', {
          groupIdJson: JSON.stringify([source.groupId]),
        })
        .getOne();

      // 2. Знайти запис призначення
      const destinationPair = await queryRunner.manager
        .createQueryBuilder(Schedule, 's')
        .where('s.semester_number = :semester', { semester })
        .andWhere('s.week_number = :weekNumber', {
          weekNumber: destination.weekNumber,
        })
        .andWhere('s.day_number = :dayNumber', {
          dayNumber: destination.dayNumber,
        })
        .andWhere('s.pair_number = :pairNumber', {
          pairNumber: destination.pairNumber,
        })
        .andWhere('s.groups_list @> :groupIdJson', {
          groupIdJson: JSON.stringify([destination.groupId]),
        })
        .getOne();

      if (!sourcePair && !destinationPair) {
        // Пустий на пустий. Нічого не робимо.
        await queryRunner.commitTransaction();
        return;
      }

      // 3. Переносимо Source -> Destination
      if (sourcePair) {
        await queryRunner.manager.delete(Schedule, { id: sourcePair.id });
        const newPair1 = queryRunner.manager.create(Schedule, {
          ...sourcePair,
          id: undefined,
          weekNumber: destination.weekNumber,
          dayNumber: destination.dayNumber,
          pairNumber: destination.pairNumber,
        });
        await queryRunner.manager.save(newPair1);
      }

      // 4. Переносимо Destination -> Source
      if (destinationPair) {
        await queryRunner.manager.delete(Schedule, { id: destinationPair.id });
        const newPair2 = queryRunner.manager.create(Schedule, {
          ...destinationPair,
          id: undefined,
          weekNumber: source.weekNumber,
          dayNumber: source.dayNumber,
          pairNumber: source.pairNumber,
        });
        await queryRunner.manager.save(newPair2);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new RpcException({
        message: err.message || 'Internal server error during group pair swap.',
        code: 13,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async swapTeacherPairs(input: SwapTeacherPairsDto): Promise<void> {
    const { semester, source, destination } = input;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Знайти запис джерела
      const sourcePair = await queryRunner.manager
        .createQueryBuilder(Schedule, 's')
        .where('s.semester_number = :semester', { semester })
        .andWhere('s.week_number = :weekNumber', {
          weekNumber: source.weekNumber,
        })
        .andWhere('s.day_number = :dayNumber', { dayNumber: source.dayNumber })
        .andWhere('s.pair_number = :pairNumber', {
          pairNumber: source.pairNumber,
        })
        .andWhere('s.teachers_list @> :teacherIdJson', {
          teacherIdJson: JSON.stringify([source.teacherId]),
        })
        .getOne();

      // 2. Знайти запис призначення
      const destinationPair = await queryRunner.manager
        .createQueryBuilder(Schedule, 's')
        .where('s.semester_number = :semester', { semester })
        .andWhere('s.week_number = :weekNumber', {
          weekNumber: destination.weekNumber,
        })
        .andWhere('s.day_number = :dayNumber', {
          dayNumber: destination.dayNumber,
        })
        .andWhere('s.pair_number = :pairNumber', {
          pairNumber: destination.pairNumber,
        })
        .andWhere('s.teachers_list @> :teacherIdJson', {
          teacherIdJson: JSON.stringify([destination.teacherId]),
        })
        .getOne();

      if (!sourcePair && !destinationPair) {
        // Пустий на пустий. Нічого не робимо.
        await queryRunner.commitTransaction();
        return;
      }

      // 3. Переносимо Source -> Destination
      if (sourcePair) {
        await queryRunner.manager.delete(Schedule, { id: sourcePair.id });
        const newPair1 = queryRunner.manager.create(Schedule, {
          ...sourcePair,
          id: undefined,
          weekNumber: destination.weekNumber,
          dayNumber: destination.dayNumber,
          pairNumber: destination.pairNumber,
        });
        await queryRunner.manager.save(newPair1);
      }

      // 4. Переносимо Destination -> Source
      if (destinationPair) {
        await queryRunner.manager.delete(Schedule, { id: destinationPair.id });
        const newPair2 = queryRunner.manager.create(Schedule, {
          ...destinationPair,
          id: undefined,
          weekNumber: source.weekNumber,
          dayNumber: source.dayNumber,
          pairNumber: source.pairNumber,
        });
        await queryRunner.manager.save(newPair2);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new RpcException({
        message:
          err.message || 'Internal server error during teacher pair swap.',
        code: 13,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async updateGroups(input: UpdateGroupsDto): Promise<void> {
    const { toNextYear } = input;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const direction = toNextYear === 1 ? 1 : -1;

      const schedules = await queryRunner.manager.find(Schedule);

      for (const schedule of schedules) {
        const updatedGroups: string[] = [];
        let shouldDelete = false;

        for (const group_code of schedule.groupsList) {
          const parts = group_code.split('-');
          if (parts.length !== 2) {
            updatedGroups.push(group_code);
            continue;
          }

          // Регулярний вираз для розбору частини після дефісу: [S1][X][Z][S2][S3]
          // Група 1: S1 (зп, п, з, в) - Форма навчання
          // Група 2: X (Рік вступу/Курс) - 1 цифра
          // Група 3: Z (Номер групи) - 1 або 2 цифри
          // Група 4: S2S3 (Освітній рівень + Контингент)
          const regex = /^(зп|[пзв])?(\d)(\d{1,2})((мп|мн|ф)?і?)$/u;
          const match = parts[1].match(regex);

          if (!match) {
            updatedGroups.push(group_code);
            continue;
          }

          const s1 = match[1] || ''; // S1
          const course = parseInt(match[2], 10); // Перша цифра XX (Рік вступу/Курс)
          const groupNumber = match[3]; // Решта цифр
          const s2s3 = match[4] || ''; // S2S3

          const newCourse = course + direction;

          if (newCourse < 1 || newCourse > 4) {
            shouldDelete = true;
            break;
          }

          const newGroupCode = `${parts[0]}-${s1}${newCourse}${groupNumber}${s2s3}`;
          updatedGroups.push(newGroupCode);
        }

        if (shouldDelete) {
          await queryRunner.manager.delete(Schedule, { id: schedule.id });
        } else if (updatedGroups.length > 0) {
          await queryRunner.manager.update(Schedule, schedule.id, {
            groupsList: updatedGroups,
          });
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new RpcException({
        message: err.message || 'Internal server error during group update.',
        code: 13,
      });
    } finally {
      await queryRunner.release();
    }
  }

  private async checkTeacherConflict(
    semesterNumber: SemesterNumber,
    weekNumber: WeekNumber,
    dayNumber: DayNumber,
    pairNumber: PairNumber,
    teacherIds: string[],
    excludePairId?: string
  ): Promise<void> {
    if (teacherIds.length === 0) {
      return;
    }
    const conflictConditions = teacherIds
      .map((id) => `(s.teachers_list::jsonb) @> '${JSON.stringify([id])}'`)
      .join(' OR ');

    let query = this.scheduleRepository
      .createQueryBuilder('s')
      .where('s.semester_number = :semesterNumber', { semesterNumber })
      .andWhere('s.week_number = :weekNumber', { weekNumber })
      .andWhere('s.day_number = :dayNumber', { dayNumber })
      .andWhere('s.pair_number = :pairNumber', { pairNumber })
      .andWhere(`(${conflictConditions})`);

    if (excludePairId) {
      query = query.andWhere('s.id != :excludePairId', { excludePairId });
    }

    const conflictingPair = await query.getOne();

    if (conflictingPair) {
      const conflictingTeacherId = conflictingPair.teachersList.find((tId) =>
        teacherIds.includes(tId)
      );

      if (conflictingTeacherId) {
        const teacher = await this.teacherRepository.findOne({
          where: { id: conflictingTeacherId },
          select: ['fullName'],
        });

        const teacherName = teacher?.fullName || `ID ${conflictingTeacherId}`;

        throw new RpcException({
          message: `Teacher ${teacherName} already has a pair at this time (Week: ${weekNumber}, Day: ${dayNumber}, Pair: ${pairNumber}).`,
          code: 6,
        });
      }

      throw new RpcException({
        message:
          'Schedule conflict: one of the teachers is already busy at this time.',
        code: 6,
      });
    }
  }

  private async validateCurriculumRelations(
    subjectId: string,
    teacherIds: string[],
    groupIds: string[]
  ): Promise<void> {
    const curriculum = await this.curriculumService.findOneById(subjectId);

    if (!curriculum) {
      throw new RpcException({
        message: `Curriculum with ID ${subjectId} not found`,
        code: 5,
      });
    }

    const allowedTeacherIds = new Set(
      curriculum.relatedTeachers.map((t) => t.id)
    );
    const allowedGroupIds = new Set(
      curriculum.relatedGroups.map((g) => g.id)
    );

    for (const teacherId of teacherIds) {
      if (!allowedTeacherIds.has(teacherId)) {
        const teacher = await this.teacherRepository.findOne({
          where: { id: teacherId },
          select: ['fullName'],
        });
        const teacherName = teacher?.fullName || `ID ${teacherId}`;

        throw new RpcException({
          message: `Teacher ${teacherName} is not assigned to curriculum ${curriculum.subjectName} (ID: ${subjectId})`,
          code: 6,
        });
      }
    }

    for (const groupId of groupIds) {
      if (!allowedGroupIds.has(groupId)) {
        const group = await this.groupRepository.findOne({
          where: { id: groupId },
          select: ['groupCode'],
        });
        const groupCode = group?.groupCode || `ID ${groupId}`;
        throw new RpcException({
          message: `Group ${groupCode} is not assigned to curriculum ${curriculum.subjectName} (ID: ${subjectId})`,
          code: 6,
        });
      }
    }
  }
}
