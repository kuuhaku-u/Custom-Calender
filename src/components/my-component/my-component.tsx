import { Component, Prop, h, Watch, EventEmitter, State, Event, Host, Fragment, Listen } from '@stencil/core';
import { CalendarEntry } from '../../utils/calendar-entry';
import { Calendar, addDays, limitsDate, limitsMonth, subDays } from '../../utils/calendar';
import '@tec-registry/nest-notification-modal-dialog';
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.scss',
  shadow: true,
})
export class MyComponent {
  /**
   * @props
   */
  @Prop() dayNames = [];
  @Prop() monthNames = [];
  @Prop() showFillDays = true;
  @Prop() limitLower = 28;
  @Prop() limitUpper = 71;
  /**
   * @states
   */
  @State() date = Calendar.getToday();
  @State() daysInMonth: number[];
  @State() selectedDate: CalendarEntry;
  @State() eventDates = [];
  @State() disableCrossForArrowForward = false;
  @State() disableCrossForArrowBackward = false;
  @State() openModal = false;
  @State() showTheWheel = false;
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
  private _fillStartCount: number;
  private _fillEndCount: number;
  readonly _today: CalendarEntry;
  private _lowerLimitDate: any;
  private _upperLimitDate: any;
  private _ulDateArr: any[] = [];
  private _upperLimitMonth: any;
  private _lowerLimitMonth: any;
  constructor() {
    this._today = Calendar.getToday();
  }
  /**
   *
   * @param date
   * @function emitDate
   */
  @Watch('date')
  watchDate(date: CalendarEntry): void {
    if ('month' in date && 'year' in date) {
      this.selectedDate = date;
    }
  }
  /**
   *
   * @function Call_the_SetCalendarDetails
   */
  componentWillLoad() {
    this._upperLimitDate = addDays(new Date(), this.limitUpper).toISOString().split('T')[0];
    this._lowerLimitDate = subDays(new Date(), this.limitLower).toISOString().split('T')[0];
    this._upperLimitMonth = limitsMonth(this.limitUpper, this.limitLower).upperLimitMonth;
    this._lowerLimitMonth = limitsMonth(this.limitUpper, this.limitLower).lowerLimitMonth;
    this._upperLimitDate = limitsDate(this.limitUpper, this.limitLower).upperLimitDate;
    this._lowerLimitDate = limitsDate(this.limitUpper, this.limitLower).lowerLimitDate;
    this.setCalendarDetails();
  }
  /**
   *
   * @function set_calendar_days
   */
  setCalendarDetails(): void {
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
    this._fillStartCount = calendar.getFillStartCount();
    this._fillEndCount = calendar.daysInCalendar - calendar.getFillEndCount();
  }
  /**
   *
   * @function validate_date
   */
  getValidDate(): CalendarEntry {
    if (this.date?.month > this._upperLimitMonth) {
      return;
    }
    if (this.date?.month < this._lowerLimitMonth) {
      return;
    }
    let date = this.date;
    if (!('month' in this.date && 'year' in this.date)) {
      date = this._today;
    }
    return date;
  }
  /**
   *
   * @function emit_dates_when_changes_happen_days
   */
  dayChangedHandler(calendarEntry: CalendarEntry): void {
    this.dayChanged.emit(calendarEntry);
  }
  /**
   *
   * @function emit_dates_when_changes_happen_month
   */
  monthChangedHandler(calendarEntry: CalendarEntry): void {
    this.monthChanged.emit(calendarEntry);
  }
  /**
   *
   * @function calls_emitters
   */
  daySelectedHandler = (day): void => {
    this.selectedDate = {
      day,
      month: this.date.month,
      year: this.date.year,
    };
    this.dayChangedHandler(this.selectedDate);
  };
  /**
   *
   * @function prv_month
   */
  switchToPreviousMonth = (): void => {
    this.date = this.getValidDate();
    if (this.date.month !== 1) {
      this.date.month -= 1;
    } else {
      this.date.month = 12;
      this.date.year -= 1;
    }
    if (typeof this.date !== 'undefined') {
      delete this.date.day;
    }
    if (this.date.month === this._lowerLimitMonth && this.date.year === 2023) {
      const searchValue = 1;
      const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
        if (currentElement === searchValue) {
          acc.push(currentIndex);
        }
        return acc;
      }, []);
      this._ulDateArr = [];
      this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
      const indexOfLimit = this._ulDateArr.indexOf(this._lowerLimitDate);
      this._ulDateArr = this._ulDateArr.splice(0, indexOfLimit);
    } else {
      this._ulDateArr = [];
    }
    this.setCalendarDetails();
    this.monthChangedHandler(this.date);
    this.disableCrossForArrowForward = false;
    if (this._lowerLimitMonth >= this.date.month) {
      this.disableCrossForArrowBackward = true;
    }
    if (this.disableCrossForArrowBackward) {
      return;
    }
  };
  /**
   *
   * @function nxt_month
   */
  switchToNextMonth = (): void => {
    this.date = this.getValidDate();
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
    if (this.date.month === this._upperLimitMonth) {
      const searchValue = 1;
      const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
        if (currentElement === searchValue) {
          acc.push(currentIndex);
        }
        return acc;
      }, []);
      this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
      const indexOfLimit = this._ulDateArr.indexOf(this._upperLimitDate);
      this._ulDateArr = this._ulDateArr.splice(indexOfLimit + 1);
    } else {
      this._ulDateArr = [];
    }
    if (this._upperLimitMonth < this.date.month) {
      this.disableCrossForArrowForward = true;
    }
    if (this.disableCrossForArrowForward) {
      return;
    }
  };
  /**
   * @listeners
   *
   */
  @Listen('eveIdk')
  lkk(e) {
    this.showTheWheel = !e.detail;
  }
  /**
   * @General_FUNCTIONS
   *
   */

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
      this._today.day === day &&
      this._today.month === month &&
      this._today.year === year &&
      this._today.year === year &&
      !(index < this._fillStartCount || index >= this._fillEndCount)
    );
  }
  isSelectedDay(day: number, index: number) {
    return (
      typeof this.selectedDate !== 'undefined' &&
      this.selectedDate.day === day &&
      this.selectedDate.month === this.date.month &&
      this.selectedDate.year === this.date.year &&
      !(index < this._fillStartCount || index >= this._fillEndCount)
    );
  }
  isDisabled(day) {
    const isTrue = this._ulDateArr.find(el => el == day);
    return isTrue ? 'dim' : 'not-dim';
  }
  /**
   *
   * @returns
   * @_______HTML
   */
  renderArrows() {
    return (
      <div part="calender-part-arrows" style={{ width: '50px', display: 'flex' }}>
        <div onClick={this.switchToPreviousMonth} style={{ opacity: this.disableCrossForArrowBackward ? '.3' : '1  ', width: '25px' }} part="calender-part-arrows-left">
          {'<'}
        </div>
        <div onClick={this.switchToNextMonth} style={{ opacity: this.disableCrossForArrowForward ? '.3' : '1', width: '25px' }} part="calender-part-arrows-right">
          {'>'}
        </div>
      </div>
    );
  }
  renderHeader(date) {
    return (
      <header part="full-calender-part">
        <div part="calender-part-icons">
          <div onClick={() => (this.showTheWheel = true)} style={{ cursor: 'pointer' }} part="calender-part-month-name">
            {this.monthNames[date.month - 1]}
          </div>
        </div>
        {this.renderArrows()}
      </header>
    );
  }
  renderDayName() {
    return this.dayNames.map(dayName => <span part="calender-part-day-name">{dayName}</span>);
  }
  renderMonthDays(date) {
    return this.daysInMonth.map((day, index) => {
      const classNameDigit = this.getDigitClassNames(day, date.month, date.year, index);
      if (index < this._fillStartCount || index >= this._fillEndCount) {
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
    });
  }
  renderFullCalendar = () => {
    const date = this.getValidDate();
    return (
      <div class="calendar material" part="calender-container-part">
        {this.renderHeader(date)}
        <div class="day-names" part="calender-part-day-name-container">
          {this.renderDayName()}
        </div>
        <div class="days-in-month" part="calender-part-day-name-month-container">
          {this.renderMonthDays(date)}
        </div>
      </div>
    );
  };
  renderCalendarWheel() {
    return (
      <div>
        <idk-2 selectedMonth="June" stuff={{ upper: this._upperLimitMonth, lower: this._lowerLimitMonth }} />
      </div>
    );
  }
  renderModalContent() {
    return (
      <div class="all" part="calender-move-property-part" onMouseLeave={() => (this.openModal = false)}>
        {this.openModal && <Fragment>{!this.showTheWheel ? this.renderFullCalendar() : this.renderCalendarWheel()}</Fragment>}
      </div>
    );
  }
  renderModal() {
    return <nest-notification-modal-dialog open={this.openModal}>{this.renderModalContent()}</nest-notification-modal-dialog>;
  }
  render() {
    return (
      <Host>
        {this._upperLimitDate}__==Upper&&Lower==__{this._lowerLimitDate}
        <br />
        <button onClick={() => (this.openModal = true)}>Click</button>
        {this.renderModal()}
      </Host>
    );
  }
}
