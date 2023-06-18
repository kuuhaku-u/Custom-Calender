import { Component, Prop, h, Watch, EventEmitter, State, Event, Host, Fragment, Listen } from '@stencil/core';
import { CalendarEntry } from '../../utils/calendar-entry';
import { Calendar, addDays, compareDates, limitsDate, limitsMonth, limitsYear, monthNumber, subDays } from '../../utils/calendar';
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
  @Prop() locale = 'en-NZ';
  @Prop() showFillDays = false;
  @Prop() limitLower = 28;
  @Prop() hasMinMax = true;
  @Prop() limitUpper = 31;
  @Prop() calendarEndDate = '2050-12-12';
  @Prop() calendarStartDate = '2000-01-01';
  @Prop() openModal = true;
  /**
   * @states
   */
  @State() dayNames = [];
  @State() meetInfo = [
    { day: 19, month: 6, year: 2023, info: 'SOME TASK' },
    { day: 25, month: 6, year: 2023, info: 'SOME TASK #2' },
  ];
  @State() monthNames = [];
  @State() date = Calendar.getToday();
  @State() daysInMonth: number[];
  @State() selectedDate: CalendarEntry;
  @State() eventDates = [];
  @State() disableCrossForArrowForward = false;
  @State() disableCrossForArrowBackward = false;
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
  readonly today: CalendarEntry;
  private _isUpperLieInSameYear: boolean;
  private _isLowerLieInSameYear: boolean;
  private _lowerLimitDate: any;
  private _upperLimit: any;
  private _lowerLimit: any;
  private _currentMonth = new Date().getMonth() + 1;
  private _upperLimitDate: any;
  private _ulDateArr: any[] = [];
  private _upperLimitMonth: any;
  private _lowerLimitMonth: any;
  private _upperLimitYear: number;
  private _lowerLimitYear: number;
  constructor() {
    this.today = Calendar.getToday();
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
  componentDidLoad() {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.monthNames = Array.from({ length: 12 }, (_, month) => {
      const date = new Date(2023, month);
      return date.toLocaleString(this.locale, { month: 'long' });
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.dayNames = Array.from({ length: 7 }, (_, day) => {
      const date = new Date(2023, 0, day + 1);
      const dayName = date.toLocaleString(this.locale, { weekday: 'long' });
      return dayName.slice(0, 2);
    });
    const sundayIndex = this.dayNames.findIndex(day => day === 'Su');
    if (sundayIndex > -1) {
      this.dayNames.splice(sundayIndex, 1);
      this.dayNames.push('Su');
    }
  }
  /**
   *
   * @function Call_the_SetCalendarDetails
   */
  componentWillLoad() {
    if (this.hasMinMax) {
      this._upperLimit = addDays(new Date(), this.limitUpper);
      this._lowerLimit = subDays(new Date(), this.limitLower);
      const limitsMonthResult = limitsMonth(this.limitUpper, this.limitLower);
      const limitsDateResult = limitsDate(this.limitUpper, this.limitLower);
      const limitsYearResult = limitsYear(this.limitUpper, this.limitLower);
      this._upperLimitMonth = limitsMonthResult.upperLimitMonth;
      this._lowerLimitMonth = limitsMonthResult.lowerLimitMonth;
      this._upperLimitDate = limitsDateResult.upperLimitDate;
      this._lowerLimitDate = limitsDateResult.lowerLimitDate;
      this._upperLimitYear = limitsYearResult.upperLimitYear;
      this._lowerLimitYear = limitsYearResult.lowerLimitYear;
      this._isUpperLieInSameYear = this._upperLimitYear === new Date().getFullYear();
      this._isLowerLieInSameYear = this._lowerLimitYear === new Date().getFullYear();
      this.setCalendarDetails();
      if (this._currentMonth === this._upperLimitMonth && this._currentMonth === this._lowerLimitMonth) {
        this.disableCrossForArrowForward = true;
        this.disableCrossForArrowBackward = true;
        const searchValue = 1;
        const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
          if (currentElement === searchValue) {
            acc.push(currentIndex);
          }
          return acc;
        }, []);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLowerLimit = this._ulDateArr.indexOf(this._lowerLimitDate);
        const indexOfUpperLimit = this._ulDateArr.indexOf(this._upperLimitDate);
        const ulDateArr = this._ulDateArr.splice(indexOfUpperLimit + 1, this._ulDateArr.length);
        const llDateArr = this._ulDateArr.splice(0, indexOfLowerLimit);
        const newArr = ulDateArr.concat(llDateArr);
        this._ulDateArr = newArr;
      }
      if (this._currentMonth === this._upperLimitMonth && new Date().getFullYear() === this._upperLimitYear && this._currentMonth !== this._lowerLimitMonth) {
        this.disableCrossForArrowForward = true;
        const searchValue = 1;
        const indices = this.daysInMonth.reduce((acc, currentElement, currentIndex) => {
          if (currentElement === searchValue) {
            acc.push(currentIndex);
          }
          return acc;
        }, []);
        this._ulDateArr = [];
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._upperLimitDate);
        this._ulDateArr = this._ulDateArr.splice(indexOfLimit + 1, this._ulDateArr.length);
      }
      if (this._currentMonth === this._lowerLimitMonth && new Date().getFullYear() === this._lowerLimitYear && this._currentMonth !== this._upperLimitMonth) {
        this.disableCrossForArrowBackward = true;
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
      }
    } else {
      this.setCalendarDetails();
    }
  }
  /**
   *
   * @function set_calendar_days
   */
  setCalendarDetails(): void {
    if (this.hasMinMax) {
      const upperLimit = addDays(new Date(), this.limitUpper).getMonth() + 1;
      const lowerLimit = subDays(new Date(), this.limitLower).getMonth() + 1;
      if (!this._isLowerLieInSameYear && !this._isUpperLieInSameYear) {
        if (this.date?.month <= lowerLimit && this.date.year === this._lowerLimitYear) {
          this.date.month = lowerLimit;
          // return;
        }
        if (this.date?.month >= upperLimit && this.date.year === this._upperLimitYear) {
          this.date.month = upperLimit;
          // return;
        }
      } else if (this._isUpperLieInSameYear && this._isLowerLieInSameYear) {
        if (this.date?.month > upperLimit) {
          this.date.month = upperLimit;
          // return;
        }
        if (this.date?.month < lowerLimit) {
          this.date.month = lowerLimit;
          // return;
        }
      } else if (this._isUpperLieInSameYear && !this._isLowerLieInSameYear) {
        if (this.date?.month > upperLimit && this.date.year === new Date().getFullYear()) {
          this.date.month = upperLimit;
          // return;
        }
        if (this.date?.month <= this._lowerLimitMonth && this.date.year === this._lowerLimitYear) {
          this.date.month = lowerLimit;
          // return;
        }
      } else if (!this._isUpperLieInSameYear && this._isLowerLieInSameYear) {
        if (this.date?.month >= this._upperLimitMonth && this.date.year === this._upperLimitYear) {
          this.date.month = this._upperLimitMonth;
          // return;
        }
        if (this.date?.month < lowerLimit && this.date.year === new Date().getFullYear()) {
          this.date.month = lowerLimit;
          // return;
        }
      }
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
    let date = this.date;
    if (this.hasMinMax) {
      if (this._isUpperLieInSameYear && this._isLowerLieInSameYear) {
        if (this.date?.month > this._upperLimitMonth || this.date?.month < this._lowerLimitMonth) {
          return date;
        }
      } else if (this._isUpperLieInSameYear && !this._isLowerLieInSameYear) {
        if ((this.date?.month > this._lowerLimitMonth && this.date.year === this._lowerLimitYear) || this.date?.month > this._upperLimitMonth) {
          return date;
        }
      } else if (!this._isUpperLieInSameYear && this._isLowerLieInSameYear) {
        if ((this.date?.month < this._upperLimitMonth && this.date.year === this._upperLimitYear) || this.date?.month < this._lowerLimitMonth) {
          return date;
        }
      }
    }
    if (!('month' in this.date && 'year' in this.date)) {
      date = this.today;
    }
    return date;
  }
  /**
   *
   * @function emit_dates_when_changes_happen_days
   */
  dayChangedHandler(calendarEntry: CalendarEntry): void {
    if (this.hasMinMax) {
      const upperDateOut = this._upperLimit;
      const lowerDateOut = this._lowerLimit;
      const incomingDate = calendarEntry.year + '-' + calendarEntry.month + '-' + calendarEntry.day;
      const res = compareDates(upperDateOut, incomingDate, lowerDateOut);
      if (res) {
        this.dayChanged.emit(calendarEntry);
      } else {
        console.warn('NOT VALID DATE');
      }
    } else {
      this.dayChanged.emit(calendarEntry);
    }
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
    if (this.disableCrossForArrowBackward) {
      return;
    }
    this.date = this.getValidDate();
    const { month, year } = this.date;
    if (month !== 1) {
      this.date.month -= 1;
    } else {
      this.date.month = 12;
      this.date.year -= 1;
    }
    if (typeof this.date !== 'undefined') {
      delete this.date.day;
    }
    if (this.hasMinMax) {
      const isLowerLimitSameYear = this.isLowerLieInSameYearFun();
      const isLowerLimitReached = month === this._lowerLimitMonth + 1 && year === this._lowerLimitYear;
      if (isLowerLimitSameYear && isLowerLimitReached) {
        this.disableCrossForArrowForward = false;
        this.disableCrossForArrowBackward = true;
        const searchValue = 1;
        const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._lowerLimitDate);
        this._ulDateArr = this._ulDateArr.splice(0, indexOfLimit);
        this.setCalendarDetails();
      } else if (!isLowerLimitSameYear && isLowerLimitReached) {
        this.disableCrossForArrowBackward = true;
        const searchValue = 1;
        const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._lowerLimitDate);
        this._ulDateArr = this._ulDateArr.splice(0, indexOfLimit);
        this.disableCrossForArrowBackward = true;
        this.setCalendarDetails();
      } else {
        this._ulDateArr = [];
        if (!this.disableCrossForArrowBackward) {
          this.setCalendarDetails();
          this.disableCrossForArrowForward = false;
        }
      }
    } else {
      this.setCalendarDetails();
    }
  };
  switchToNextMonth = (): void => {
    this.date = this.getValidDate();
    if (this.disableCrossForArrowForward) {
      return;
    }
    if (this.date.month !== 12) {
      this.date.month += 1;
    } else {
      this.date.month = 1;
      this.date.year += 1;
    }
    delete this.date?.day;
    if (this.hasMinMax) {
      const isUpperLimitSameYear = this.isUpperLieInSameYearFun();
      const isUpperLimitReached = this.date.month === this._upperLimitMonth && this.date.year === this._upperLimitYear;
      if (isUpperLimitSameYear && isUpperLimitReached) {
        this.disableCrossForArrowForward = true;
        this.setCalendarDetails();
        const searchValue = 1;
        const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._upperLimitDate);
        this._ulDateArr = this._ulDateArr.splice(indexOfLimit + 1);
      } else if (!isUpperLimitSameYear && isUpperLimitReached) {
        const searchValue = 1;
        const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._upperLimitDate);
        this._ulDateArr = this._ulDateArr.splice(indexOfLimit + 1);
        this.disableCrossForArrowForward = true;
      } else {
        this._ulDateArr = [];
        if (!this.disableCrossForArrowForward) {
          this.setCalendarDetails();
          this.disableCrossForArrowBackward = false;
        }
      }
    } else {
      this.setCalendarDetails();
    }
  };
  isUpperLieInSameYearFun = (): boolean => {
    return this.date.year === this._upperLimitYear;
  };
  getIndicesOfValue = (array: number[], value: number): number[] => {
    return array.reduce((acc, currentElement, currentIndex) => {
      if (currentElement === value) {
        acc.push(currentIndex);
      }
      return acc;
    }, []);
  };
  isLowerLieInSameYearFun = (): boolean => {
    return this.date.year === this._lowerLimitYear;
  };
  /**
   *
   * @function nxt_month
   */
  /**
   * @listeners
   *
   */
  @Listen('closeWheel2')
  wheelListener2(e) {
    this.showTheWheel = !e.detail;
  }
  @Listen('closeWheel')
  wheelListener(e) {
    const monthIndex = monthNumber(e.detail.selectedMonth);
    this.date.month = monthIndex;
    this.date.year = parseInt(e.detail.year);
    this.setCalendarDetails();
    const isLowerLimitReached = this.date.month === this._lowerLimitMonth;
    const isUpperLimitReached = this.date.month === this._upperLimitMonth;
    if (this._isUpperLieInSameYear && this.date.year == new Date().getFullYear()) {
      if (isUpperLimitReached) {
        this.disableCrossForArrowForward = true;
        this.disableCrossForArrowBackward = false;
        const searchValue = 1;
        const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._upperLimitDate);
        this._ulDateArr = this._ulDateArr.splice(indexOfLimit + 1);
      } else {
        this.disableCrossForArrowForward = false;
        this.disableCrossForArrowBackward = false;
        this._ulDateArr = [];
      }
    }
    if (this.date.year == this._upperLimitYear && this.date.month == this._upperLimitMonth) {
      if (isUpperLimitReached) {
        this.disableCrossForArrowForward = true;
        this.disableCrossForArrowBackward = false;
        const searchValue = 1;
        const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
        this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
        const indexOfLimit = this._ulDateArr.indexOf(this._upperLimitDate);
        this._ulDateArr = this._ulDateArr.splice(indexOfLimit + 1);
      } else {
        this.disableCrossForArrowForward = false;
        this.disableCrossForArrowBackward = false;
        this._ulDateArr = [];
      }
    }
    if (this._isLowerLieInSameYear && this.date.year == new Date().getFullYear()) {
      if (this._currentMonth >= this.date.month) {
        if (isLowerLimitReached) {
          this.disableCrossForArrowBackward = true;
          this.disableCrossForArrowForward = false;
          const searchValue = 1;
          const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
          this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
          const indexOfLimit = this._ulDateArr.indexOf(this._lowerLimitDate);
          this._ulDateArr = this._ulDateArr.splice(0, indexOfLimit);
        } else {
          this.disableCrossForArrowForward = false;
          this.disableCrossForArrowBackward = false;
          this._ulDateArr = [];
        }
      }
    }
    if (this.date.year == this._lowerLimitYear && this.date.month == this._lowerLimitMonth) {
      if (this._currentMonth >= this.date.month) {
        if (isLowerLimitReached) {
          this.disableCrossForArrowBackward = true;
          this.disableCrossForArrowForward = false;
          const searchValue = 1;
          const indices = this.getIndicesOfValue(this.daysInMonth, searchValue);
          this._ulDateArr = this.daysInMonth.slice(indices[0], indices[1]);
          const indexOfLimit = this._ulDateArr.indexOf(this._lowerLimitDate);
          this._ulDateArr = this._ulDateArr.splice(0, indexOfLimit);
        } else {
          this.disableCrossForArrowForward = false;
          this.disableCrossForArrowBackward = false;
          this._ulDateArr = [];
        }
      }
    }
  }
  /**
   * @General_FUNCTIONS
   *
   */
  getDigitClassNames = (day: number, month: number, year: number, index: number): string => {
    const classNameDigit = [];
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
      this.today.day === day && this.today.month === month && this.today.year === year && this.today.year === year && !(index < this._fillStartCount || index >= this._fillEndCount)
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
    if (!this.hasMinMax) {
      return '';
    }
    const isTrue = this._ulDateArr.find(el => el == day);
    return isTrue ? 'dim' : 'not-dim';
  }
  /**
   *
   * @returns {HTML}
   */
  renderArrows() {
    return (
      <div part="calender-part-arrows" style={{ width: '50px', display: 'flex', cursor: 'pointer' }}>
        <div onClick={this.switchToPreviousMonth} style={{ opacity: this.disableCrossForArrowBackward ? '.3' : '1  ', width: '25px' }} part="calender-part-arrows-left">
          {'<'}
          {/* <i class="n-icon-prev-arrow" aria-hidden="true"></i> */}
        </div>
        <div onClick={this.switchToNextMonth} style={{ opacity: this.disableCrossForArrowForward ? '.3' : '1', width: '25px' }} part="calender-part-arrows-right">
          {'>'}
          {/* <i class="n-icon-next-arrow" aria-hidden="true"></i> */}
        </div>
      </div>
    );
  }
  renderHeader() {
    return (
      <header part="full-calender-part">
        <div part="calender-part-icons">
          <div onClick={() => (this.showTheWheel = true)} style={{ cursor: 'pointer' }} part="calender-part-month-name">
            {this.monthNames[this.date.month - 1]} {this.date.year}
          </div>
        </div>
        {this.renderArrows()}
      </header>
    );
  }
  renderDayName() {
    return this.dayNames.map(dayName => <span part="calender-part-day-name">{dayName}</span>);
  }
  @State() msg = '';
  handleMouse(ee) {
    const isThere = this.meetInfo.find(e => e.day == ee.innerHTML);
    if (isThere) {
      this.msg = isThere.info;
    }
  }
  renderMonthDays(date) {
    return this.daysInMonth.map((day, index) => {
      const classNameDigit = this.getDigitClassNames(day, date.month, date.year, index);
      if (index < this._fillStartCount || index >= this._fillEndCount) {
        return (
          <span class="disabled" part="calender-move-property-part-disabled">
            {this.showFillDays ? day : ''}
          </span>
        );
      } else {
        return (
          <span onClick={() => this.daySelectedHandler(day)} part="calender-part-day-name-span">
            <i
              part="calender-part-day-name-i"
              class={` ${this.meetInfo.find(e => e.day == day) && ' icon'} ${classNameDigit} ${this.isDisabled(day)}`}
              key={index}
              data-message={this.msg}
              onMouseOver={e => this.handleMouse(e.target)}
            >
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
        {this.renderHeader()}
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
        <wheel-container
          locale={this.locale}
          calendarEndDate={this.calendarEndDate}
          calendarStartDate={this.calendarStartDate}
          hasMinMax={this.hasMinMax}
          selectedMonth="June"
          limits={{ upper: this._upperLimit, lower: this._lowerLimit }}
          upperYear={this._upperLimitYear}
          lowerLimitYear={this._lowerLimitYear}
        />
      </div>
    );
  }
  renderModalContent() {
    return (
      <div class="all" part="calender-move-property-part">
        {this.openModal && <Fragment>{!this.showTheWheel ? this.renderFullCalendar() : this.renderCalendarWheel()}</Fragment>}
      </div>
    );
  }
  @Listen('backgroundClick')
  handleNotificationModalClose() {
    this.openModal = false;
  }
  renderModal() {
    return (
      <nest-notification-modal-dialog id="nest-calendar" open={this.openModal}>
        {this.renderModalContent()}
      </nest-notification-modal-dialog>
    );
  }
  render() {
    return (
      <Host>
        <slot>{this.renderModal()}</slot>
      </Host>
    );
  }
}
