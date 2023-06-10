import { Component, Prop, h, Watch, EventEmitter, State, Event, Host, Fragment, Listen } from '@stencil/core';
import { CalendarEntry } from '../../utils/calendar-entry';
import { Calendar, addDays, subDays } from '../../utils/calendar';
import '@tec-registry/nest-notification-modal-dialog';
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.scss',
  shadow: true,
})
export class MyComponent {
  @Prop() dayNames = [];
  @Prop() monthNames = [];
  @Prop() showFillDays = true;
  @State() date = Calendar.getToday();
  @State() daysInMonth: number[];
  @State() wheelSelMonth = 0;
  @State() selectedDate: CalendarEntry;
  @State() eventDates = [];
  @State() disableCrossForArrowForward = false;
  @State() limitUpper = 5;
  @State() limitLower = 5;
  @State() currentMonth = new Date().getMonth() + 1;
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
  // private llDate: any;
  // private ulDate: any;
  private ulDateArr: any[] = [];
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
    // this.ulDate = addDays(new Date(), this.limitUpper).toISOString().split('T')[0];
    // this.llDate = subDays(new Date(), this.limitLower).toISOString().split('T')[0];
    this.setCalendarDetails();
  }
  setCalendarDetails(): void {
    const lowerLimitDate = subDays(new Date(), this.limitLower).getDate();
    const upperLimitDay = addDays(new Date(), this.limitUpper).getDate();
    console.log(subDays(new Date(), this.limitLower).toISOString(), addDays(new Date(), this.limitUpper).toISOString());

    const upperLimit = addDays(new Date(), this.limitUpper).getMonth() + 1;
    const lowerLimit = subDays(new Date(), this.limitLower).getMonth() + 1;
    if (this.date?.month > upperLimit) {
      this.date.month = upperLimit;
      return;
    }
    if (this.date?.month < lowerLimit) {
      this.date.month = lowerLimit;
      return;
    }
    this.date = this.getValidDate();
    const calendar = new Calendar(this.date.year, this.date.month);
    this.daysInMonth = calendar.getCalendarDays();
    this.fillStartCount = calendar.getFillStartCount();
    this.fillEndCount = calendar.daysInCalendar - calendar.getFillEndCount();
    this.ulDateArr = this.daysInMonth;
    if (lowerLimit === this.currentMonth) {
      this.disableCrossForArrowBackward = true;
      const loIndex = this.ulDateArr.indexOf(upperLimitDay);
      this.ulDateArr = this.ulDateArr.slice(loIndex, this.ulDateArr.length);
      console.log(this.ulDateArr);
    }
    if (upperLimit === this.currentMonth) {
      this.disableCrossForArrowForward = true;
      // const upIndex = this.ulDateArr.indexOf(lowerLimitDate);
      // this.ulDateArr = this.ulDateArr.slice(0, upIndex);
    }
  }
  getValidDate(): CalendarEntry {
    if (this.date === undefined) {
      return;
    }
    const upperLimit = addDays(new Date(), this.limitUpper).getMonth();
    const lowerLimit = subDays(new Date(), this.limitLower).getMonth();
    if (this.date?.month > upperLimit + 1) {
      return;
    }
    if (this.date?.month < lowerLimit + 1) {
      return;
    }
    let date = this.date;
    if (!('month' in this.date && 'year' in this.date)) {
      date = this.today;
    }
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
    const lowerLimit = subDays(new Date(), this.limitLower).getMonth() + 1;
    const lowerLimitDate = subDays(new Date(), this.limitLower).getDate();
    const upperLimitDay = addDays(new Date(), this.limitUpper).getDate();
    if (lowerLimit === this.currentMonth) {
      this.date.month = this.currentMonth;
      this.disableCrossForArrowBackward = true;
      const upIndex = this.ulDateArr.indexOf(lowerLimitDate);
      const loIndex = this.ulDateArr.indexOf(upperLimitDay);
      this.ulDateArr = this.ulDateArr.slice(loIndex, upIndex);
      return;
    }
    if (this.disableCrossForArrowBackward) {
      return;
    }
    if (this.date.month !== 1) {
      this.date.month -= 1;
    } else {
      this.date.month = 12;
      this.date.year -= 1;
    }
    if (typeof this.date !== 'undefined') {
      delete this.date.day;
    }
    if (this.date.month === lowerLimit) {
      const searchValue = 1;
      const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
        if (currentElement === searchValue) {
          acc.push(currentIndex);
        }
        return acc;
      }, []);
      this.ulDateArr = [];
      this.ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
      const fg = this.ulDateArr.indexOf(lowerLimitDate);
      this.ulDateArr = this.ulDateArr.splice(0, fg);
    } else {
      this.ulDateArr = [];
    }
    this.setCalendarDetails();
    this.monthChangedHandler(this.date);
    this.disableCrossForArrowForward = false;
    if (lowerLimit >= this.date.month) {
      this.disableCrossForArrowBackward = true;
      if (this.disableCrossForArrowBackward) {
        return;
      }
    }
  };
  switchToNextMonth = (): void => {
    this.date = this.getValidDate();
    const upperLimit = addDays(new Date(), this.limitUpper).getMonth();
    const upperLimitDay = addDays(new Date(), this.limitUpper).getDate();
    const lowerLimitDate = subDays(new Date(), this.limitLower).getDate();
    if (upperLimit === this.currentMonth) {
      this.date.month = this.currentMonth;
      this.disableCrossForArrowForward = true;
      const upIndex = this.ulDateArr.indexOf(lowerLimitDate);
      const loIndex = this.ulDateArr.indexOf(upperLimitDay);
      this.ulDateArr = this.ulDateArr.slice(loIndex, upIndex);
      return;
    }
    if (this.disableCrossForArrowForward) {
      return;
    }
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
    if (this.date.month === upperLimit + 1) {
      const searchValue = 1;
      const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
        if (currentElement === searchValue) {
          acc.push(currentIndex);
        }
        return acc;
      }, []);
      this.ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
      const fg = this.ulDateArr.indexOf(upperLimitDay);
      this.ulDateArr = this.ulDateArr.splice(fg);
    } else {
      this.ulDateArr = [];
    }
    if (upperLimit < this.date.month) {
      this.disableCrossForArrowForward = true;
    }
    if (this.disableCrossForArrowForward) {
      return;
    }
  };
  @Listen('eveIdk')
  lkk(e) {
    this.all = !e.detail.clicked;
    this.wheelSelMonth = e.detail.indexOfMonth;
    this.date.month = this.wheelSelMonth;
    const upperLimit = addDays(new Date(), this.limitUpper).getMonth();
    const upperLimitDay = addDays(new Date(), this.limitUpper).getDate();
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
    if (this.date.month === upperLimit) {
      const searchValue = 1;
      const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
        if (currentElement === searchValue) {
          acc.push(currentIndex);
        }
        return acc;
      }, []);
      this.ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
      const fg = this.ulDateArr.indexOf(upperLimitDay);
      this.ulDateArr = this.ulDateArr.splice(fg);
    } else {
      this.ulDateArr = [];
    }
    if (upperLimit < this.date.month) {
      this.disableCrossForArrowForward = true;
    }
    if (this.disableCrossForArrowForward) {
      return;
    }
  }
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
  isDisabled(day) {
    const isTrue = this.ulDateArr.find(el => el == day);
    return isTrue ? 'dim' : 'not-dim';
  }
  renderAll = () => {
    const date = this.getValidDate();
    date.month = this.wheelSelMonth === 0 ? date.month : this.wheelSelMonth;
    return (
      <div class="calendar material" part="calender-container-part">
        <header part="full-calender-part">
          <div part="calender-part-icons">
            <div onClick={() => (this.all = true)} style={{ cursor: 'pointer' }} part="calender-part-month-name">
              {this.monthNames[date.month - 1]}
            </div>
          </div>
          <div part="calender-part-arrows" style={{ width: '50px', display: 'flex' }}>
            <div
              onClick={this.switchToPreviousMonth}
              style={{ opacity: this.disableCrossForArrowBackward ? '.3' : '1  ', width: '25px' }}
              // class="arrows"
              part="calender-part-arrows-left"
            >
              {'<'}
            </div>
            <div onClick={this.switchToNextMonth} style={{ opacity: this.disableCrossForArrowForward ? '.3' : '1', width: '25px' }} part="calender-part-arrows-right">
              {'>'}
            </div>
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
                  <i part="calender-part-day-name-i" class={`${classNameDigit} ${this.isDisabled(day)}`}>
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
    const upperLimit = addDays(new Date(), this.limitUpper).getMonth() + 1;
    const lowerLimit = subDays(new Date(), this.limitLower).getMonth() + 1;
    return (
      <div>
        <idk-2 selectedMonth="June" stuff={{ upper: upperLimit, lower: lowerLimit }} />
      </div>
    );
  }
  render() {
    return (
      <Host>
        <button onClick={() => (this.openModal = true)}>Click</button>
        <nest-notification-modal-dialog open={this.openModal}>
          <div class="all" part="calender-move-property-part" onMouseLeave={() => (this.openModal = false)}>
            {this.openModal && <Fragment>{true ? this.renderAll() : this.renderOnly()}</Fragment>}
          </div>
        </nest-notification-modal-dialog>
      </Host>
    );
  }
}
