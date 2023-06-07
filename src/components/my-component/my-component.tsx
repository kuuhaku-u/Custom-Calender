import { Component, Prop, h, Watch, EventEmitter, State, Event, Host, Fragment } from '@stencil/core';
import { CalendarEntry } from '../../utils/calendar-entry';
import { Calendar } from '../../utils/calendar';
import '@tec-registry/nest-notification-modal-dialog';
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.scss',
  shadow: true,
})
export class MyComponent {
  @Prop() dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  @Prop() monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  @Prop() showFillDays = true;
  @State() date = Calendar.getToday();
  @State() daysInMonth: number[];
  @State() selectedDate: CalendarEntry;
  @State() eventDates = [];
  @State() disableCrossForArrowForward = false;
  @State() disableCrossForArrowBackward = false;
  @State() openModal = false;
  @State() all = false;
  @Event({
    eventName: 'dayChanged',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  dayChanged: EventEmitter<CalendarEntry>;
  @Event({
    eventName: 'monthChanged',
    composed: true,
    cancelable: true,
    bubbles: true,
  })
  monthChanged: EventEmitter<CalendarEntry>;
  private fillStartCount: number;
  private fillEndCount: number;
  readonly today: CalendarEntry;
  constructor() {
    this.today = Calendar.getToday();
  }
  @Watch('date')
  watchDate(date: CalendarEntry): void {
    if ('month' in date && 'year' in date) {
      this.selectedDate = date;
    }
  }
  componentWillLoad() {
    this.setCalendarDetails();
  }
  addDays(date: Date, days: number | string): Date {
    date.setDate(date.getDate() + parseInt(days as any));
    return date;
  }
  subDays(date: Date, days: number | string): Date {
    date.setDate(date.getDate() - parseInt(days as any));
    return date;
  }
  setCalendarDetails(): void {
    const upperLimi= this.addDays(new Date(), 61).getMonth();
    if (this.date?.month > upperLimi + 1) {
      return;
    }
    this.date = this.getValidDate();
    const upperLimit = this.addDays(new Date(), 61).getMonth() + 1;
    const lowerLimit = this.subDays(new Date(), 28).getMonth() + 1;
    if (upperLimit >= this.date.month && lowerLimit <= this.date.month) {
      const calendar = new Calendar(this.date.year, this.date.month);
      this.daysInMonth = calendar.getCalendarDays();
      this.fillStartCount = calendar.getFillStartCount();
      this.fillEndCount = calendar.daysInCalendar - calendar.getFillEndCount();
    } else {
      return;
    }
  }
  getValidDate(): CalendarEntry {
    const upperLimit = this.addDays(new Date(), 61).getMonth();
    if (this.date?.month > upperLimit + 1) {
      return;
    }
    let date = this.date;
    if (!('month' in this.date && 'year' in this.date)) {
      date = this.today;
    }
    console.log(date);
    return date;
  }
  dayChangedHandler(calendarEntry: CalendarEntry): void {
    this.dayChanged.emit(calendarEntry);
  }
  daySelectedHandler = (day): void => {
    this.selectedDate = {
      day,
      month: this.date.month,
      year: this.date.year,
    };
    this.dayChangedHandler(this.selectedDate);
  };
  monthChangedHandler(calendarEntry: CalendarEntry): void {
    this.monthChanged.emit(calendarEntry);
  }
  switchToPreviousMonth = (): void => {
    this.date = this.getValidDate();
    const lowerLimit = this.subDays(new Date(), 28).getMonth() + 1;
    if (this.date.month !== 1) {
      this.date.month -= 1;
    } else {
      this.date.month = 12;
      this.date.year -= 1;
    }
    if (typeof this.date !== 'undefined') {
      delete this.date.day;
    }
    this.setCalendarDetails();
    this.monthChangedHandler(this.date);
    this.disableCrossForArrowForward = false;
    if (lowerLimit >= this.date.month) {
      this.disableCrossForArrowBackward = true;
    }
    if (this.disableCrossForArrowBackward) {
      return;
    }
  };
  switchToNextMonth = (): void => {
    this.date = this.getValidDate();
    const upperLimit = this.addDays(new Date(), 61).getMonth();
    let tempMonth;
    if (this.date.month !== 12) {
      this.date.month += 1;
    } else {
      this.date.month = 1;
      this.date.year += 1;
    }
    delete this.date.day;
    this.setCalendarDetails();
    this.monthChangedHandler(this.date);
    this.disableCrossForArrowBackward = false;
    if (upperLimit < this.date.month) {
      // console.log("L");
      // this.date.month = tempMonth;
      this.disableCrossForArrowForward = true;
    } else {
      // tempMonth = this.date.month;
      console.log('f');
    }
    if (this.disableCrossForArrowForward) {
      return;
    }
  };
  getDigitClassNames = (day: number, month: number, year: number, index: number): string => {
    let classNameDigit = [];
    if (day.toString().length === 1) {
      classNameDigit.push('padding-single-digit');
    }
    if (this.isToday(day, month, year, index)) {
      classNameDigit.push('active');
    }
    if (this.isSelectedDay(day, index)) {
      classNameDigit.push('selected');
    }
    if (this.eventDates.includes(day)) {
      classNameDigit.push('has-event');
    }
    return classNameDigit.join(' ');
  };
  isToday(day: number, month: number, year: number, index: number): boolean {
    return (
      this.today.day === day && this.today.month === month && this.today.year === year && this.today.year === year && !(index < this.fillStartCount || index >= this.fillEndCount)
    );
  }
  isSelectedDay(day: number, index: number) {
    return (
      typeof this.selectedDate !== 'undefined' &&
      this.selectedDate.day === day &&
      this.selectedDate.month === this.date.month &&
      this.selectedDate.year === this.date.year &&
      !(index < this.fillStartCount || index >= this.fillEndCount)
    );
  }
  renderAll = () => {
    const date = this.getValidDate();
    return (
      <div class="calendar material" part="calender-container-part">
        <header part="full-calender-part">
          <div part="calender-part-icons">
            <div onClick={() => (this.all = true)} style={{ cursor: 'pointer' }} part="calender-part-month-name">
              {this.monthNames[date.month - 1]}
            </div>
          </div>
          <div part="calender-part-arrows">
            <span onClick={this.switchToPreviousMonth} style={{ opacity: this.disableCrossForArrowBackward ? '.3' : '1  ' }} class="arrows" part="calender-part-arrows-left">
              {'<'}
            </span>
            <span onClick={this.switchToNextMonth} style={{ opacity: this.disableCrossForArrowForward ? '.3' : '1' }} part="calender-part-arrows-right">
              {'>'}
            </span>
          </div>
        </header>
        <div class="day-names" part="calender-part-day-name-container">
          {this.dayNames.map(dayName => (
            <span part="calender-part-day-name">{dayName}</span>
          ))}
        </div>
        <div class="days-in-month" part="calender-part-day-name-month-container">
          {this.daysInMonth.map((day, index) => {
            const classNameDigit = this.getDigitClassNames(day, date.month, date.year, index);
            if (index < this.fillStartCount || index >= this.fillEndCount) {
              return <span class="disabled">{this.showFillDays ? day : ''}</span>;
            } else {
              return (
                <span onClick={() => this.daySelectedHandler(day)} part="calender-part-day-name-span">
                  <i part="calender-part-day-name-i" class={classNameDigit}>
                    {day}
                  </i>
                </span>
              );
            }
          })}
        </div>
      </div>
    );
  };
  renderOnly() {
    return (
      <div onClick={() => (this.all = false)}>
        <idk-2 selectedMonth="June" />
      </div>
    );
  }
  render() {
    return (
      <Host>
        <button onClick={() => (this.openModal = true)}>Click</button>
        <nest-notification-modal-dialog open={this.openModal}>
          <div class="all" part="calender-move-property-part" onMouseLeave={() => (this.openModal = false)}>
            {this.openModal && <Fragment>{!this.all ? this.renderAll() : this.renderOnly()}</Fragment>}
          </div>
        </nest-notification-modal-dialog>
      </Host>
    );
  }
}
