import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Curriculum } from './Curriculum.entity';
import { SemesterNumber } from '../types/SemesterNumber.enum';
import { WeekNumber } from '../types/WeekNumber.enum';
import { DayNumber } from '../types/DayNumber.enum';
import { PairNumber } from '../types/PairNumber.enum';
import { VisitFormat } from '../types/VisitFormat.enum';
import { LessonType } from '../types/LessonType.enum';


@Entity({ name: 'schedule' })
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('jsonb', { nullable: true, name: 'teachers_list' })
  teachersList: string[];

  @Column('jsonb', { nullable: true, name: 'groups_list' })
  groupsList: string[];

  @Column({ name: 'subject_id' })
  subjectId!: string;

  @ManyToOne(() => Curriculum)
  @JoinColumn({ name: 'subject_id' })
  subject!: Curriculum;

  @Column({
    type: 'enum',
    enum: SemesterNumber,
    name: 'semester_number',
  })
  semesterNumber!: SemesterNumber;

  @Column({
    type: 'enum',
    enum: WeekNumber,
    name: 'week_number',
  })
  weekNumber!: WeekNumber;

  @Column({
    type: 'enum',
    enum: DayNumber,
    name: 'day_number',
  })
  dayNumber!: DayNumber;

  @Column({
    type: 'enum',
    enum: PairNumber,
    name: 'pair_number',
  })
  pairNumber!: PairNumber;

  @Column({
    type: 'enum',
    enum: VisitFormat,
    name: 'visit_format',
  })
  visitFormat!: VisitFormat;

  @Column({
    type: 'enum',
    enum: LessonType,
    name: 'lesson_type',
  })
  lessonType!: LessonType;

  @Column({ nullable: true })
  audience: string;
}
