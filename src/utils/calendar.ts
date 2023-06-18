/* eslint-disable func-style */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CalendarEntry } from './calendar-entry';
const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export class Calendar {
  readonly year: number;
  readonly month: number;
  readonly daysInCalendarWithFiveRows = 42;
  readonly daysInCalendarWithFourRows = 35;
  readonly daysInCalendarWithThreeRows = 28;
  public daysInCalendar = this.daysInCalendarWithFourRows;
  private _fillStartCount = 0;
  private _fillEndCount = 0;
  private _currentMonthCount: number;
  private _fillCount = [6, 0, 1, 2, 3, 4, 5];
  constructor(year: number, month: number) {
    this.year = year;
    this.month = month;
  }
  public getCalendarDays(): number[] {
    const daysOfCurrentMonth = this._getDaysOfCurrentMonth();
    const fillStartCount = this._fillCount[this.getFirstDayOfMonth()];
    const fillEndCount = this.daysInCalendarWithFourRows - (daysOfCurrentMonth.length + fillStartCount);
    this._currentMonthCount = daysOfCurrentMonth.length;
    this._fillStartCount = fillStartCount;
    this._fillEndCount = fillEndCount;
    const fillStart = fillStartCount > 0 ? this._getDaysOfLastMonth(fillStartCount) : [];
    const fillEnd = this._getDaysOfNextMonth(fillEndCount);
    return fillStart.concat(daysOfCurrentMonth).concat(fillEnd);
  }
  private _getDaysOfCurrentMonth(): number[] {
    return this._getDaysOfMonth(this.month);
  }
  private _getDaysOfLastMonth(fillStartCount: number): number[] {
    const daysOfMonth = this._getDaysOfMonth(this.month - 1);
    return daysOfMonth.slice(-fillStartCount);
  }
  private _getDaysOfNextMonth(endCount: number): number[] {
    const daysOfMonth = this._getDaysOfMonth(this.month + 1);
    let slicedDays;
    if (endCount <= -1) {
      endCount = this.daysInCalendarWithFiveRows - (this._currentMonthCount + this._fillStartCount);
      slicedDays = daysOfMonth.slice(0, endCount);
      this.daysInCalendar = this.daysInCalendarWithFiveRows;
      this._fillEndCount = endCount;
    } else if (endCount === 7 && this._currentMonthCount + this._fillStartCount === 28) {
      endCount = this.daysInCalendarWithThreeRows - (this._currentMonthCount + this._fillStartCount);
      slicedDays = daysOfMonth.slice(0, endCount);
      this.daysInCalendar = this.daysInCalendarWithThreeRows;
      this._fillEndCount = endCount;
    } else {
      slicedDays = daysOfMonth.slice(0, endCount);
    }
    return slicedDays;
  }
  private _getDaysOfMonth(month: number): number[] {
    const daysOfMonth = new Date(this.year, month, 0).getDate();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return Array.from({ length: daysOfMonth }, (_, i) => i + 1);
  }
  public getFirstDayOfMonth(): number {
    return new Date(this.year, this.month - 1, 1).getDay();
  }
  public getFillStartCount(): number {
    return this._fillStartCount;
  }
  public getFillEndCount(): number {
    return this._fillEndCount;
  }
  public addDays(date: Date, days: number | string): Date {
    date.setDate(date.getDate() + parseInt(days as any));
    return date;
  }
  public subDays(date: Date, days: number | string): Date {
    date.setDate(date.getDate() - parseInt(days as any));
    return date;
  }
  public static getToday(): CalendarEntry {
    return {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };
  }
}
export function addDays(date: Date, days: number | string): Date {
  date.setDate(date.getDate() + parseInt(days as any));
  return date;
}
export function subDays(date: Date, days: number | string): Date {
  date.setDate(date.getDate() - parseInt(days as any));
  return date;
}
export function limitsMonth(upper, lower) {
  return {
    upperLimitMonth: addDays(new Date(), upper).getMonth() + 1,
    lowerLimitMonth: subDays(new Date(), lower).getMonth() + 1,
  };
}
export function limitsDate(upper, lower) {
  return {
    upperLimitDate: addDays(new Date(), upper).getDate(),
    lowerLimitDate: subDays(new Date(), lower).getDate(),
  };
}
export function limitsYear(upper, lower) {
  return {
    upperLimitYear: addDays(new Date(), upper).getUTCFullYear(),
    lowerLimitYear: subDays(new Date(), lower).getUTCFullYear(),
  };
}
export function compareDates(dateOne, dateTwo, dateThree) {
  const upperLimit = addDays(new Date(dateOne), 1);
  const lowerLimit = subDays(new Date(dateThree), 1);
  return new Date(upperLimit) > new Date(dateTwo) && new Date(dateTwo) > new Date(lowerLimit);
}
export function calculateYears(startDate, endDate) {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  let years = endYear - startYear;
  const yearArray = [];
  if (endDate <= new Date(endYear, startDate.getMonth(), startDate.getDate())) {
    years--;
  }
  for (let i = 0; i <= years; i++) {
    yearArray.push(startYear + i);
  }
  return yearArray;
}
export function getMonthsBetweenDates(startDate, endDate, locale) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = [];
  while (start.getMonth() <= end.getMonth() || start.getFullYear() < end.getFullYear()) {
    const month = start.toLocaleString(locale, { month: 'long' });
    const year = start.getFullYear();
    const formattedMonth = month + ' ' + year;
    months.push(formattedMonth);
    start.setMonth(start.getMonth() + 1);
  }
  return months;
}
export function monthNumber(month: string): number {
  const monthIndex = monthName.indexOf(month) + 1;
  return monthIndex;
}
