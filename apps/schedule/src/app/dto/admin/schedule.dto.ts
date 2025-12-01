import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SemesterNumber } from '../../types/SemesterNumber.enum';
import { WeekNumber } from '../../types/WeekNumber.enum';
import { DayNumber } from '../../types/DayNumber.enum';
import { PairNumber } from '../../types/PairNumber.enum';
import { LessonType } from '../../types/LessonType.enum';
import { VisitFormat } from '../../types/VisitFormat.enum';

// --- AddPairDto / EditPairDto Base ---

export class BasePairDto {
  @IsEnum(SemesterNumber)
  semesterNumber: SemesterNumber;

  @IsArray()
  @IsString({ each: true })
  groupsList: string[];

  @IsArray()
  @IsString({ each: true })
  teachersList: string[];

  @IsString()
  subjectId: string;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;

  @IsEnum(LessonType)
  lessonType: LessonType;

  @IsEnum(VisitFormat)
  visitFormat: VisitFormat;

  @IsOptional()
  @IsString()
  audience?: string;
}

export class AddPairDto extends BasePairDto {}

export class EditPairDto extends BasePairDto {
  @IsString()
  id: string;
}

// --- DeletePairDto ---

export class DeletePairDto {
  @IsString()
  id: string;
}

// --- Swap Group Pairs DTO ---

export class SwapGroupLocationDto {
  @IsString()
  groupId: string;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;
}

export class SwapGroupPairsDto {
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ValidateNested()
  @Type(() => SwapGroupLocationDto)
  source: SwapGroupLocationDto;

  @ValidateNested()
  @Type(() => SwapGroupLocationDto)
  destination: SwapGroupLocationDto;
}

// --- Swap Teacher Pairs DTO ---

export class SwapTeacherLocationDto {
  @IsString()
  teacherId: string;

  @IsEnum(WeekNumber)
  weekNumber: WeekNumber;

  @IsEnum(DayNumber)
  dayNumber: DayNumber;

  @IsEnum(PairNumber)
  pairNumber: PairNumber;
}

export class SwapTeacherPairsDto {
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @ValidateNested()
  @Type(() => SwapTeacherLocationDto)
  source: SwapTeacherLocationDto;

  @ValidateNested()
  @Type(() => SwapTeacherLocationDto)
  destination: SwapTeacherLocationDto;
}

// --- GetPair ---

export class GetPairsByCriteriaDto {
  @IsEnum(SemesterNumber)
  semester: SemesterNumber;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;
}

export class GetPairsInfoDto {
  @IsString()
  id: string;
}

export class PairMinimalInfo {
    id!: string;

    subjectName: string;

    semesterNumber: SemesterNumber;

    weekNumber: WeekNumber;

    dayNumber: DayNumber;

    pairNumber: PairNumber;
}

export class ScheduleGroup {
  id: string;
  groupCode: string;
}

export class ScheduleTeacher {
  id: string;
  name: string;
}

export class GetPairsByCriteriaResponse {
  pairs: PairMinimalInfo[];
}

export class GetPairInfoResponse {
    id: string;
    subjectId: string;
    groupsList: ScheduleGroup[];
    teachersList: ScheduleTeacher[];
    lessonType: LessonType;
    visitFormat: VisitFormat;
    audience?: string;
}

// --- UpdateGroupsDto ---

export class UpdateGroupsDto {
  @IsNumber()
  action: 0 | 1; 
}
