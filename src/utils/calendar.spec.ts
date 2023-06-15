import { Calendar, addDays, subDays, limitsMonth, limitsDate, limitsYear, compareDates, calculateYears, getMonthsBetweenDates } from './calendar';
describe('Calendar', () => {
  describe('getCalendarDays', () => {
    it('should return an array of calendar days', () => {
      const calendar = new Calendar(2023, 6);
      const calendarDays = calendar.getCalendarDays();
      expect(Array.isArray(calendarDays)).toBe(true);
      expect(calendarDays.length).toBeGreaterThanOrEqual(28);
      expect(calendarDays.length).toBeLessThanOrEqual(42);
      expect(calendarDays[0]).toBeGreaterThanOrEqual(1);
      expect(calendarDays[0]).toBeLessThanOrEqual(31);
    });
    it('should handle the case when the fillStartCount is greater than 0', () => {
      const calendar = new Calendar(2023, 9);
      const calendarDays = calendar.getCalendarDays();
      expect(calendar.getFillStartCount()).toBeGreaterThan(0);
      expect(calendarDays.length).toBe(35); // Four rows
      expect(calendarDays[0]).toBeGreaterThanOrEqual(1);
      expect(calendarDays[0]).toBeLessThanOrEqual(31);
    });
    it('should handle the case when the fillEndCount is 5 and currentMonthCount + fillStartCount is 28', () => {
      const calendar = new Calendar(2023, 1);
      const calendarDays = calendar.getCalendarDays();
      expect(calendar.getFillEndCount()).toBe(5);
      expect(calendarDays[0]).toBeGreaterThanOrEqual(1);
      expect(calendarDays[0]).toBeLessThanOrEqual(28);
    });
  });
  describe('getFirstDayOfMonth', () => {
    it('should return the first day of the month', () => {
      const calendar = new Calendar(2023, 6);
      const firstDay = calendar.getFirstDayOfMonth();
      expect(firstDay).toBeGreaterThanOrEqual(0);
      expect(firstDay).toBeLessThanOrEqual(6);
    });
  });
  describe('addDays', () => {
    it('should add the specified number of days to the given date', () => {
      const date = new Date(2023, 5, 15);
      const result = addDays(date, 5);
      expect(result instanceof Date).toBe(true);
      expect(result.getDate()).toBe(20);
    });
  });
  describe('subDays', () => {
    it('should subtract the specified number of days from the given date', () => {
      const date = new Date(2023, 5, 15);
      const result = subDays(date, 5);
      expect(result instanceof Date).toBe(true);
      expect(result.getDate()).toBe(10);
    });
  });
  describe('limitsMonth', () => {
    it('should return the upper and lower limit months based on the given values', () => {
      const result = limitsMonth(10, 5);
      expect(result.upperLimitMonth).toBeGreaterThanOrEqual(1);
      expect(result.upperLimitMonth).toBeLessThanOrEqual(12);
      expect(result.lowerLimitMonth).toBeGreaterThanOrEqual(1);
      expect(result.lowerLimitMonth).toBeLessThanOrEqual(12);
      expect(result.upperLimitMonth).toBeGreaterThanOrEqual(result.lowerLimitMonth);
    });
  });
  describe('limitsDate', () => {
    it('should return the upper and lower limit dates based on the given values', () => {
      const result = limitsDate(10, 5);
      expect(result.upperLimitDate).toBeGreaterThanOrEqual(1);
      expect(result.upperLimitDate).toBeLessThanOrEqual(31);
      expect(result.lowerLimitDate).toBeGreaterThanOrEqual(1);
      expect(result.lowerLimitDate).toBeLessThanOrEqual(31);
      expect(result.upperLimitDate).toBeGreaterThanOrEqual(result.lowerLimitDate);
    });
  });
  describe('limitsYear', () => {
    it('should return the upper and lower limit years based on the given values', () => {
      const result = limitsYear(10, 5);
      const currentYear = new Date().getFullYear();
      expect(result.upperLimitYear).toBeGreaterThanOrEqual(currentYear);
      expect(result.lowerLimitYear).toBeLessThanOrEqual(currentYear);
      expect(result.upperLimitYear).toBeGreaterThanOrEqual(result.lowerLimitYear);
    });
  });
  describe('compareDates', () => {
    it('should compare three dates and return false if the second date is between the other two', () => {
      const dateOne = '2023-06-01';
      const dateTwo = '2023-06-15';
      const dateThree = '2023-06-30';
      const result = compareDates(dateOne, dateTwo, dateThree);
      expect(result).toBe(false);
    });
    it('should compare three dates and return false if the second date is not between the other two', () => {
      const dateOne = '2023-06-01';
      const dateTwo = '2023-07-15';
      const dateThree = '2023-06-30';
      const result = compareDates(dateOne, dateTwo, dateThree);
      expect(result).toBe(false);
    });
  });
  describe('calculateYears', () => {
    it('should calculate an array of years between the start and end date', () => {
      const startDate = new Date(2020, 0, 1);
      const endDate = new Date(2023, 0, 1);
      const result = calculateYears(startDate, endDate);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toBe(2020);
    });
  });
  describe('getMonthsBetweenDates', () => {
    it('should return an array of formatted month and year strings between the start and end date', () => {
      const startDate = '2023-01-01';
      const endDate = '2023-06-01';
      const result = getMonthsBetweenDates(startDate, endDate);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(6);
      expect(result[0]).toBe('January 2023');
      expect(result[5]).toBe('June 2023');
    });
  });
});
