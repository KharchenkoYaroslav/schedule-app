import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Teacher } from '../entities/Teacher.entity';
import { Curriculum } from '../entities/Curriculum.entity';
import {
  SearchTeacherInput,
  SearchTeacherResponse,
} from '../dto/public/search-teacher.dto';
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  FindAllTeachersResponse,
} from '../dto/admin/teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Curriculum)
    private readonly curriculumRepository: Repository<Curriculum>,
  ) {}

  async searchTeacher(
    input: SearchTeacherInput
  ): Promise<SearchTeacherResponse> {
    const teachers = await this.teacherRepository.find({
      where: {
        fullName: Like(`%${input.fullName}%`),
      },
      select: ['id', 'fullName', 'department'],
      take: 10,
    });

    return {
      teachers: teachers.map((t) => ({
        id: t.id,
        fullName: t.fullName,
        department: t.department,
      })),
    };
  }

  async findAllTeachers(): Promise<FindAllTeachersResponse> {
    const teachers = await this.teacherRepository.find();
    return { teachers };
  }

  async existsById(teacherId: string): Promise<boolean> {
    return this.teacherRepository.existsBy({ id: teacherId });
  }

  async createTeacher(input: CreateTeacherInput): Promise<void> {
    const newTeacher = this.teacherRepository.create(input);
    await this.teacherRepository.save(newTeacher);
  }

  async updateTeacher(
    teacherId: string,
    input: UpdateTeacherInput
  ): Promise<void> {
    return this.dataSource.transaction(async (entityManager) => {
      const teacher = await entityManager.findOneBy(Teacher, { id: teacherId });

      if (!teacher) {
        throw new RpcException({
          message: `Teacher with ID ${teacherId} not found`,
          code: 5,
        });
      }

      if (
        input.fullName !== undefined
      ) {
        teacher.fullName = input.fullName;
      }

      if (input.department !== undefined) {
        teacher.department = input.department;
      }
      if (input.post !== undefined) {
        teacher.post = input.post;
      }

      await entityManager.save(Teacher, teacher);
    });
  }

  async deleteTeacher(teacherId: string): Promise<void> {
    const teacher = await this.teacherRepository.findOneBy({ id: teacherId });

    if (!teacher) {
      throw new RpcException({
        message: `Teacher with ID ${teacherId} not found`,
        code: 5,
      });
    }

    const curriculumDependency = await this.curriculumRepository
      .createQueryBuilder('c')
      .where('c.related_teachers @> :teacherIdJson', {
        teacherIdJson: JSON.stringify([{ id: teacherId }]),
      })
      .getOne();

    if (curriculumDependency) {
      throw new RpcException({
        message: `Cannot delete teacher with ID ${teacherId}. It is referenced in curriculum: ${curriculumDependency.subjectName} (ID: ${curriculumDependency.id})`,
        code: 6,
      });
    }

    await this.teacherRepository.delete({ id: teacherId });
  }
}
