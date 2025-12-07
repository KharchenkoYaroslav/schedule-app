import { describe, it, expect } from 'vitest';
import { formatTypeAndFormat, formatSubject, transformName } from './format-utils';

describe('Format Utils', () => {
  describe('formatTypeAndFormat', () => {
    it('should format both type and format correctly', () => {
      expect(formatTypeAndFormat('Лек', 'Очно')).toBe('Лек., Очно.');
    });

    it('should format only type', () => {
      expect(formatTypeAndFormat('Прак', undefined)).toBe('Прак.,');
    });

    it('should format only visit format', () => {
      expect(formatTypeAndFormat(undefined, 'Дист')).toBe('Дист.');
    });

    it('should return empty string if both are undefined', () => {
      expect(formatTypeAndFormat(undefined, undefined)).toBe('');
    });

    it('should return empty string if both are empty strings', () => {
      expect(formatTypeAndFormat('', '')).toBe('');
    });
  });

  describe('formatSubject', () => {
    it('should return subject name if provided', () => {
      expect(formatSubject('Математика')).toBe('Математика');
    });

    it('should return empty string if subject is undefined', () => {
      expect(formatSubject(undefined)).toBe('');
    });

    it('should return empty string if subject is empty', () => {
      expect(formatSubject('')).toBe('');
    });
  });

  describe('transformName', () => {
    it('should transform full name (3 words) to initials', () => {
      expect(transformName('Шевченко Тарас Григорович')).toBe('Шевченко Т.Г.');
    });

    it('should return original string if name has less than 3 words', () => {
      expect(transformName('John')).toBe('John');
      expect(transformName('John Doe')).toBe('John Doe');
    });

    it('should return original string if name has more than 3 words', () => {
      expect(transformName('Складне Довге Ім\'я По-батькові')).toBe('Складне Довге Ім\'я По-батькові');
    });

    it('should handle undefined input', () => {
      expect(transformName(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(transformName('')).toBe('');
    });
  });
});
