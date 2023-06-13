import { Component, Prop, h, Watch, EventEmitter, State, Event, Host, Fragment, Listen } from '@stencil/core';
import { CalendarEntry } from '../../utils/calendar-entry';
import { Calendar, addDays, compareDates, limitsDate, limitsMonth, limitsYear, subDays } from '../../utils/calendar';
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
  @Prop() limitLower = 224;
  @Prop() hasMinMax = true;
  @Prop() limitUpper = 261;
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
  private isUpperLieInSameYear: boolean;
  private isLowerLieInSameYear: boolean;
  private _lowerLimitDate: any;
  private _upperLimit: any;
  private _lowerLimit: any;
  private _currentMonth = new Date().getMonth() + 1;
  private _upperLimitDate: any;
  private _ulDateArr: any[] = [];
  private _upperLimitMonth: any;
  private _lowerLimitMonth: any;
  _upperLimitYear: number;
  _lowerLimitYear: number;
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
    if (this.hasMinMax) {
      this._upperLimit = addDays(new Date(), this.limitUpper);
      this._lowerLimit = subDays(new Date(), this.limitLower);
      this._upperLimitMonth = limitsMonth(this.limitUpper, this.limitLower).upperLimitMonth;
      this._lowerLimitMonth = limitsMonth(this.limitUpper, this.limitLower).lowerLimitMonth;
      this._upperLimitDate = limitsDate(this.limitUpper, this.limitLower).upperLimitDate;
      this._lowerLimitDate = limitsDate(this.limitUpper, this.limitLower).lowerLimitDate;
      this._upperLimitYear = limitsYear(this.limitUpper, this.limitLower).upperLimitYear;
      this._lowerLimitYear = limitsYear(this.limitUpper, this.limitLower).lowerLimitYear;
      this.isUpperLieInSameYear = this._upperLimitYear === new Date().getFullYear();
      this.isLowerLieInSameYear = this._lowerLimitYear === new Date().getFullYear();
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
      //!upper && !lower
      if (!this.isLowerLieInSameYear && !this.isUpperLieInSameYear) {
        if (this.date?.month <= lowerLimit && this.date.year === this._lowerLimitYear) {
          this.date.month = lowerLimit;
          return;
        }
        if (this.date?.month >= upperLimit && this.date.year === this._upperLimitYear) {
          this.date.month = upperLimit;
          return;
        }
      }
      //upper && lower
      if (this.isUpperLieInSameYear && this.isLowerLieInSameYear) {
        if (this.date?.month > upperLimit) {
          this.date.month = upperLimit;
          return;
        }
        if (this.date?.month < lowerLimit) {
          this.date.month = lowerLimit;
          return;
        }
      }
      //upper && !lower
      if (this.isUpperLieInSameYear && !this.isLowerLieInSameYear) {
        if (this.date?.month > upperLimit && this.date.year === new Date().getFullYear()) {
          this.date.month = upperLimit;
          return;
        }
        if (this.date?.month <= this._lowerLimitMonth && this.date.year === this._lowerLimitYear) {
          this.date.month = lowerLimit;
          return;
        }
      }
      //!upper && lower
      if (!this.isUpperLieInSameYear && this.isLowerLieInSameYear) {
        if (this.date?.month >= this._upperLimitMonth && this.date.year === this._upperLimitYear) {
          this.date.month = this._upperLimitMonth;
          return;
        }
        if (this.date?.month < lowerLimit && this.date.year === new Date().getFullYear()) {
          this.date.month = lowerLimit;
          return;
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
    let date;
    if (this.hasMinMax) {
      //For upper && lower
      if (this.isUpperLieInSameYear && this.isLowerLieInSameYear) {
        if (this.date?.month > this._upperLimitMonth) {
          date = this.date;
          return date;
        }
        if (this.date?.month < this._lowerLimitMonth) {
          date = this.date;
          return date;
        }
      }
      //For upper && !lower
      if (this.isUpperLieInSameYear && !this.isLowerLieInSameYear) {
        if (this.date?.month > this._lowerLimitMonth && this.date.year === this._lowerLimitYear) {
          date = this.date;
          return date;
        }
        if (this.date?.month > this._upperLimitMonth) {
          date = this.date;
          return date;
        } else {
          date = this.date;
          return date;
        }
      }
      //For !upper && lower
      if (!this.isUpperLieInSameYear && this.isLowerLieInSameYear) {
        if (this.date?.month < this._upperLimitMonth && this.date.year === this._upperLimitYear) {
          date = this.date;
          return date;
        }
        if (this.date?.month < this._lowerLimitMonth) {
          date = this.date;
          return date;
        } else {
          date = this.date;
          return date;
        }
      }
      //For !upper && !lower
    }
    date = this.date;
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
      this.dayChangedHandler(this.selectedDate);
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
    if (this.hasMinMax) {
      if (this.date.month > this._upperLimitMonth && this.date.year >= this._upperLimitYear) {
        this.date.month = this._upperLimitMonth - 1;
        this.date.year = this._upperLimitYear;
      }
      if (this.isLowerLieInSameYear) {
        if (this.date.month === this._lowerLimitMonth && this.date.year === this._lowerLimitYear) {
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
        this.disableCrossForArrowForward = false;
        if (this._lowerLimitMonth >= this.date.month) {
          this.disableCrossForArrowBackward = true;
        }
        if (this.disableCrossForArrowBackward) {
          return;
        }
      } else {
        if (this.date.month === this._lowerLimitMonth && this.date.year === this._lowerLimitYear) {
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
        } else {
          this._ulDateArr = [];
        }
        if (this.disableCrossForArrowBackward) {
          return;
        } else {
          this.setCalendarDetails();
          this.disableCrossForArrowForward = false;
        }
      }
    } else {
      this.setCalendarDetails();
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
    delete this.date?.day;
    if (this.hasMinMax) {
      if (this.date.month < this._lowerLimitMonth && this.date.year <= this._lowerLimitYear) {
        this.date.month = this._lowerLimitMonth + 1;
        this.date.year = this._lowerLimitYear;
      }
      if (this.isUpperLieInSameYear) {
        this.setCalendarDetails();
        this.disableCrossForArrowBackward = false;
        if (this.date.month === this._upperLimitMonth && this.date.year === this._upperLimitYear) {
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
      } else {
        if (this.date.month === this._upperLimitMonth && this.date.year === this._upperLimitYear) {
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
          this.disableCrossForArrowForward = true;
        } else {
          this._ulDateArr = [];
        }
        if (this.disableCrossForArrowForward) {
          return;
        } else {
          this.setCalendarDetails();
          this.disableCrossForArrowBackward = false;
        }
      }
    } else {
      this.setCalendarDetails();
    }
  };
  /**
   * @listeners
   *
   */
  @Listen('selectedMonthEvent')
  wheelListener(e) {
    this.showTheWheel = false;
    this.date.month = e.detail.indexOfMonth;
    this.setCalendarDetails();
    if (this._currentMonth >= e.detail.indexOfMonth) {
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
    } else {
      if (this.date.month === this._upperLimitMonth) {
        this.disableCrossForArrowForward = true;
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
    }
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
    if (!this.hasMinMax) {
      return '';
    }
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
            {this.monthNames[date?.month - 1]} , {this.date.year}
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
        <idk-2 selectedMonth="June" limits={{ upper: this._upperLimit, lower: this._lowerLimit }} upperYear={this._upperLimitYear} lowerLimitYear={this._lowerLimitYear} />
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
  private _refModal;
  renderModal() {
    return (
      <nest-notification-modal-dialog ref={e => (this._refModal = e)} onFocus={() => console.log('L')} open={this.openModal}>
        {this.renderModalContent()}
      </nest-notification-modal-dialog>
    );
  }
  focusFun() {
    this._refModal;
    // const activeTimeFocus = this._refModal.shadowRoot.querySelector('nest-notification-modal-dialog > div > div > div.days-in-month > span:nth-child(16) > i');
    // console.log(activeTimeFocus.innerHTML);
    this.openModal = true;
  }
  render() {
    return (
      <Host>
        Upper : {this._upperLimitDate} / {this._upperLimitMonth} / {this._upperLimitYear}
        <br />
        Lower : {this._lowerLimitDate} / {this._lowerLimitMonth} / {this._lowerLimitYear}
        <br />
        Date : {this.date?.day} / {this.date?.month} / {this.date?.year}
        <br />
        <button onClick={() => this.focusFun()}>Click</button>
        {this.renderModal()}
      </Host>
    );
  }
}
