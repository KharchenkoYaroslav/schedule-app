import { DayNumber } from '../api/types/enums/DayNumber.enum';
import { SemesterNumber } from '../api/types/enums/SemesterNumber.enum';
import { WeekNumber } from '../api/types/enums/WeekNumber.enum';
import { ScheduleItem } from '../api/types/public/schedule-item.type';

export type WeekSchedule = {
  [key in DayNumber]?: ScheduleItem[];
};
export type ScheduleMap = {
  [WeekNumber.FIRST]?: WeekSchedule;
  [WeekNumber.SECOND]?: WeekSchedule;
};

export type ScheduleType = 'group' | 'teacher';

type Dictionary = {
  [key: number]: string;
};

export const PairTime: Dictionary = {
  1: '08:30',
  2: '10:25',
  3: '12:20',
  4: '14:15',
  5: '16:10',
  6: '18:30',
  7: '20:20',
};

export enum AbbrPair {
  Assistant = 'ac',
  Teacher = 'вик',
  Senior_teacher = 'ст.вик',
  Docent = 'доц',
  Professor = 'проф',
  Unknown = 'невідомо',
}

export const WeekdayDisplay: { [key: number]: string } = {
  1: 'Понеділок',
  2: 'Вівторок',
  3: 'Середа',
  4: 'Четвер',
  5: "П'ятниця",
  6: 'Субота',
};

export const mapScheduleToWeekStructure = (
  scheduleItems: ScheduleItem[]
): ScheduleMap => {
  const scheduleMap: ScheduleMap = {};

  scheduleItems.forEach((item) => {
    if (!item.weekNumber || !item.dayNumber || !item.pairNumber) return;

    if (!scheduleMap[item.weekNumber]) {
      scheduleMap[item.weekNumber] = {};
    }
    const week = scheduleMap[item.weekNumber];

    if (week) {
      let daySchedule = week[item.dayNumber];

      if (!daySchedule) {
        daySchedule = [];
        week[item.dayNumber] = daySchedule;
      }

      daySchedule.push(item);
    }
  });

  Object.values(scheduleMap).forEach((week) => {
    if (week) {
      Object.values(week).forEach((dayPairs) => {
        if (dayPairs) {
          dayPairs.sort((a, b) => Number(a.pairNumber) - Number(b.pairNumber));
        }
      });
    }
  });

  return scheduleMap;
};

export const curentSemester = (): SemesterNumber => {
  const now = new Date();
  const month = now.getMonth() + 1;

  if (month >= 9 || month <= 1) {
    return SemesterNumber.FIRST;
  } else {
    return SemesterNumber.SECOND;
  }
};

export const getCurrentWeek = (): WeekNumber => {
  const startDate: Date = new Date('2024-10-06');
  const today: Date = new Date();

  const dayOfWeekToday: number = today.getDay();
  const diffToday: number =
    today.getDate() - dayOfWeekToday + (dayOfWeekToday === 0 ? -6 : 1);
  const startOfCurrentWeek: Date = new Date(today.setDate(diffToday));

  const dayOfWeekStart: number = startDate.getDay();
  const diffStart: number =
    startDate.getDate() - dayOfWeekStart + (dayOfWeekStart === 0 ? -6 : 1);
  const startOfStartWeek: Date = new Date(startDate.setDate(diffStart));

  const diffInTime: number =
    startOfCurrentWeek.getTime() - startOfStartWeek.getTime();
  const diffInWeeks: number = Math.floor(
    diffInTime / (1000 * 60 * 60 * 24 * 7)
  );

  const weekNumber: number = (diffInWeeks % 2) + 1;

  return weekNumber === 1 ? WeekNumber.FIRST : WeekNumber.SECOND;
};


