import { Component, EventEmitter, Host, State, Watch, h, Event, Prop, Listen } from '@stencil/core';
import { calculateYears, getMonthsBetweenDates } from '../../utils/calendar';
@Component({
  tag: 'year-wheel',
  styleUrl: 'idk-22.scss',
  shadow: true,
})
export class YearWheel {
  @Prop() limits: any;
  @Prop() locale: any;
  @Prop() hasMixMAx = false;
  @Prop() calendarEndDate = '2050-12-12';
  @Prop() calendarStartDate = '2000-01-01';
  @Prop() upperLimitYear = 2024;
  @State() monthArray: any[] = [' ', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ' '];
  @Prop() currentYear = 2023;
  @State() yearArray = [];
  @Prop() currentMonth = 'June';
  @State() month: any[];
  @State() hour: string | number = 'June';
  @State() selectedYear: number = new Date().getFullYear();
  @Event() selectedDate123: EventEmitter<{ monthIndex: number; month: string | number; year: string }>;
  @Event({ bubbles: true, composed: true }) selectedYearEvent: EventEmitter<any>;
  private _year = [];
  childElementsYear: unknown = [];
  yearSelRef?: HTMLElement;
  yearSelRefScroll?: HTMLElement;
  @State() currentYearCheck = new Date().getFullYear();
  @Listen('selectedMonthEvent')
  ik(e) {
    this.hour = e.detail.month;
    this.selectedDate123.emit({ monthIndex: this.monthArray.indexOf(this.hour), month: this.hour, year: this.selectedYear.toString() });
  }
  connectedCallback() {
    this.setAllArray();
    this.yearArray = calculateYears(new Date(this.calendarStartDate), new Date(this.calendarEndDate));
    this.yearArray.push(' ');
    this.yearArray.unshift(' ');
    this._year = calculateYears(new Date(this.limits.lower), new Date(this.limits.upper));
    this._year.push(this.upperLimitYear);
    const yearSet = new Set(this._year);
    this._year = Array.from(yearSet);
    this._year.push(' ');
    this._year.unshift(' ');
  }
  componentDidLoad() {
    this.initialScrollToActiveValue();
    const options = {
      year: {
        root: this.yearSelRefScroll,
        threshold: 0.8,
      },
    };
    const callbackMeridianIO = entries => {
      this.callBackHelper(entries, meridianElements, this.hasMixMAx ? this._year : this.yearArray);
    };
    const ampmObserver = this.yearSelRefScroll.querySelector('.scrollport').querySelectorAll('.cell');
    const meridianElements = this.childElementsYear;
    const ampmObserve = new IntersectionObserver(callbackMeridianIO, options.year);
    ampmObserver.forEach(el => {
      ampmObserve.observe(el);
    });
  }
  @Watch('selectedYear')
  emitSelectedDate() {
    this.someFun();
    this.setClassSelected(this.childElementsYear, this.selectedYear);
    this.selectedYearEvent.emit({ year: this.selectedYear });
    this.selectedDate123.emit({ monthIndex: this.monthArray.indexOf(this.hour), month: this.hour, year: this.selectedYear.toString() });
  }
  setAllArray() {
    this.month = getMonthsBetweenDates(this.limits.lower, this.limits.upper, this.locale)
      .filter(e => e.includes(this.selectedYear))
      .map(e => e.split(' ')[0].toString());
    this.month.push(' ');
    this.month.unshift(' ');
    return this.month;
  }
  setClassSelected(arr, val) {
    try {
      if (arr.length === 0 || val === undefined) {
        return;
      } else {
        arr.forEach(node => {
          if (node.innerHTML === val) {
            node.classList.add('selected');
          } else {
            node.classList.remove('selected');
          }
        });
      }
    } catch (error) {
      console.warn('error : ', error);
    }
  }
  forYear() {
    const cells = this.yearSelRefScroll.querySelectorAll('.cell');
    this.childElementsYear = cells;
  }
  dateSetter(data) {
    this.selectedYear = data;
  }
  helperFunForObservers(entry, arr, elToFindFrom) {
    if (!entry || !entry.target) {
      return;
    }
    const pos = this.yearSelRefScroll;
    const elGBC = pos.getBoundingClientRect();
    const containerTop = elGBC?.top;
    const elTop = entry.boundingClientRect.top;
    const len = arr.length;
    if (entry.isIntersecting) {
      const el = entry.target;
      const n = el.innerHTML && !isNaN(el?.innerHTML) ? Number(el?.innerHTML) : el?.innerHTML;
      const temp = elToFindFrom;
      const index = temp.indexOf(n);
      if (Math.round(elTop) - 1 <= containerTop || Math.round(elTop) - 1 < 200) {
        this.dateSetter(el?.innerHTML === ' ' ? arr[1]?.innerHTML : arr[index + 1]?.innerHTML);
      } else {
        const res = el?.innerHTML === ' ' ? arr[len - 2].innerHTML : arr[index - 1]?.innerHTML;
        this.dateSetter(res);
      }
    }
  }
  callBackHelper(entries, arr, elArr) {
    entries.forEach(entry => {
      if (entry === undefined || entry === null) {
        return undefined;
      }
      this.helperFunForObservers(entry, arr, elArr);
    });
  }
  someFun() {
    if (Number(this.selectedYear) > new Date().getFullYear()) {
      this.month = this.setAllArray();
    } else if (Number(this.selectedYear) < new Date().getFullYear()) {
      this.month = this.setAllArray();
    } else {
      this.month = this.setAllArray();
    }
  }
  initialScrollToActiveValue() {
    const yearIndex = this.hasMixMAx ? this._year.indexOf(new Date().getUTCFullYear()) - 1 : this.yearArray.indexOf(new Date().getUTCFullYear()) - 2;
    this.yearSelRefScroll.querySelector('.scrollport').scrollTo({
      top: 33 * yearIndex,
      behavior: 'smooth',
    });
    this.forYear();
  }
  forYearWheel = (arr, selection) => {
    return arr.map((time, index) => (
      <div
        id={`year_cell_${index}_id`}
        style={{ opacity: time == selection ? '1' : '.3' }}
        part={`year-cell-${time === this.selectedYear ? 'selected-part' : 'not-selected-part'}`}
        aria-label={time}
        class={`cell  ${time === selection && 'selected'} `}
        ref={el => {
          if (time !== selection) {
            return;
          }
          this.yearSelRef = el as HTMLElement;
        }}
      >
        {time}
      </div>
    ));
  };
  activeTimeHighLight() {
    return <div class="highlight border-bottom border-top" id="highlight" part="highlight-active"></div>;
  }
  renderWheel() {
    return (
      <div class="wheels" id="wheel">
        <month-wheel limits={this.limits} hasMinMax={this.hasMixMAx} month={this.hasMixMAx ? this.month : this.monthArray} />
        <div class="year" id="year_id" ref={el => (this.yearSelRefScroll = el as HTMLElement)}>
          <div class="scrollport" id="year_scrollport">
            {this.forYearWheel(this.hasMixMAx ? this._year : this.yearArray, this.selectedYear)}
          </div>
        </div>
      </div>
    );
  }
  renderMainContent() {
    return (
      <div class="container" id="container">
        {this.activeTimeHighLight()}
        {this.renderWheel()}
      </div>
    );
  }
  render() {
    return (
      <Host>
        <div>
          <slot>{this.renderMainContent()}</slot>
        </div>
      </Host>
    );
  }
}
