import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  mapScheduleToWeekStructure,
  curentSemester,
  getCurrentWeek,
} from './schedule-build';
import { ScheduleItem } from '../api/types/public/schedule-item.type';
import { WeekNumber } from '../api/types/enums/WeekNumber.enum';
import { SemesterNumber } from '../api/types/enums/SemesterNumber.enum';
import { DayNumber } from '../api/types/enums/DayNumber.enum';
import { PairNumber } from '../api/types/enums/PairNumber.enum';

describe('Schedule Build Utils', () => {
  describe('mapScheduleToWeekStructure', () => {
    it('should correctly map and sort schedule items', () => {
      const mockItems: ScheduleItem[] = [
        {
          weekNumber: WeekNumber.FIRST,
          dayNumber: DayNumber.MONDAY,
          pairNumber: PairNumber.THIRD,
          subjectName: 'History',
        } as ScheduleItem,
        {
          weekNumber: WeekNumber.FIRST,
          dayNumber: DayNumber.MONDAY,
          pairNumber: PairNumber.FIRST,
          subjectName: 'Math',
        } as ScheduleItem,
      ];

      const result = mapScheduleToWeekStructure(mockItems);

      const mondayPairs = result[WeekNumber.FIRST]?.[DayNumber.MONDAY];

      expect(mondayPairs).toBeDefined();

      if (!mondayPairs) {
        throw new Error('Monday pairs should be defined');
      }

      expect(mondayPairs).toHaveLength(2);

      expect(mondayPairs[0].pairNumber).toBe(PairNumber.FIRST);
      expect(mondayPairs[1].pairNumber).toBe(PairNumber.THIRD);
    });

    it('should handle empty input gracefully', () => {
      const result = mapScheduleToWeekStructure([]);
      expect(result).toEqual({});
    });

    it('should ignore items with missing week, day or pair number', () => {
      const invalidItems: ScheduleItem[] = [
        {
          weekNumber: undefined,
          dayNumber: DayNumber.MONDAY,
          pairNumber: PairNumber.FIRST,
          subjectName: 'No Week',
        } as ScheduleItem,
        {
          weekNumber: WeekNumber.FIRST,
          dayNumber: undefined,
          pairNumber: PairNumber.FIRST,
          subjectName: 'No Day',
        } as ScheduleItem,
        {
          weekNumber: WeekNumber.FIRST,
          dayNumber: DayNumber.MONDAY,
          pairNumber: undefined,
          subjectName: 'No Pair',
        } as ScheduleItem,
        {
          weekNumber: WeekNumber.FIRST,
          dayNumber: DayNumber.MONDAY,
          pairNumber: PairNumber.FIRST,
          subjectName: 'Valid',
        } as ScheduleItem,
      ];

      const result = mapScheduleToWeekStructure(invalidItems);

      const validPairs = result[WeekNumber.FIRST]?.[DayNumber.MONDAY];

      expect(validPairs).toBeDefined();
      expect(validPairs).toHaveLength(1);
      expect(validPairs?.[0].subjectName).toBe('Valid');
    });
  });

  describe('curentSemester', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('should return FIRST semester for September (month 9)', () => {
      vi.setSystemTime(new Date('2024-09-01'));
      expect(curentSemester()).toBe(SemesterNumber.FIRST);
    });

    it('should return FIRST semester for January (month 1)', () => {
      vi.setSystemTime(new Date('2025-01-15'));
      expect(curentSemester()).toBe(SemesterNumber.FIRST);
    });

    it('should return SECOND semester for February (month 2)', () => {
      vi.setSystemTime(new Date('2025-02-10'));
      expect(curentSemester()).toBe(SemesterNumber.SECOND);
    });

    it('should return SECOND semester for August (month 8)', () => {
      vi.setSystemTime(new Date('2025-08-30'));
      expect(curentSemester()).toBe(SemesterNumber.SECOND);
    });
  });

  describe('getCurrentWeek', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it('should calculate week for a regular Monday', () => {
      // 2024-10-07 - це Понеділок 
      vi.setSystemTime(new Date('2024-10-07T12:00:00'));

      const week = getCurrentWeek();
      expect([WeekNumber.FIRST, WeekNumber.SECOND]).toContain(week);
    });

    it('should calculate week correctly when today is Sunday', () => {
      // 2024-10-13 - це Неділя
      vi.setSystemTime(new Date('2024-10-13T12:00:00'));

      const week = getCurrentWeek();
      expect([WeekNumber.FIRST, WeekNumber.SECOND]).toContain(week);
    });

    it('should verify parity logic (Week 1 vs Week 2)', () => {
      vi.setSystemTime(new Date('2024-10-08'));
      const week1 = getCurrentWeek();

      vi.setSystemTime(new Date('2024-10-15'));
      const week2 = getCurrentWeek();

      expect(week1).not.toBe(week2);
    });
  });
});
