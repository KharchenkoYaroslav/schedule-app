import { IsNumber, IsString } from 'class-validator';

export class GetGroupScheduleInput {
  @IsString()
  groupId: string;

  @IsNumber()
  semesterNumber: number;
}

export class GetTeacherScheduleInput {
  @IsString()
  teacherId: string;

  @IsNumber()
  semesterNumber: number;
}

export class Group {
  id: string;
  groupCode: string;
  faculty: string;
}

export class Teacher {
  id: string;
  name: string;
  post: string;
}

export class ScheduleItem {
  weekNumber: number;
  dayNumber: number;
  pairNumber: number;
  subjectName: string;
  lessonType: string;
  visitFormat: string;
  audience?: string;
  groupsList?: Group[];
  teachersList?: Teacher[];
}

export class ScheduleResponse {
  schedule: ScheduleItem[];
  identifier: string;
}
