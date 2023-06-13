import { Component, EventEmitter, Host, State, Watch, h, Event, Prop } from '@stencil/core';
import { calculateYears, getMonthsBetweenDates } from '../../utils/calendar';
@Component({
  tag: 'idk-22',
  styleUrl: 'idk-22.scss',
  shadow: true,
})
export class Idk22 {
  @Prop() limits: any;
  @Prop() upperLimitYear = 2024;
  @State() monthArray: any[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  @Prop() currentYear = 2023;
  @Prop() currentMonth = 'June';
  @State() month: any[];
  @State() hour: string | number = 'June';
  @State() ampm: any = new Date().getFullYear();
  @State() prvYear: any[] = [];
  @State() nxtYear: any[] = [];
  @Event() selectedDate: EventEmitter<{ monthIndex: Number; month: string | number; year: string }>;
  private year = [];
  childElementsYear: unknown = [];
  yearSelRef?: HTMLElement;
  yearSelRefScroll?: HTMLElement;
  @State() currentYearCheck = new Date().getFullYear();
  /**
   *@HelperFunction
   */
  setAllArray() {
    this.month = getMonthsBetweenDates(this.limits.lower, this.limits.upper)
      .filter(e => e.includes(this.ampm))
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
  forYEar() {
    const cells = this.yearSelRefScroll.querySelectorAll('.cell');
    this.childElementsYear = cells;
  }
  dateSetter(data, type) {
    return (this.ampm = data);
  }
  helperFunForObservers(entry, arr, elToFindFrom, type) {
    if (!entry || !entry.target) {
      return;
    }
    const pos = this.yearSelRefScroll;
    const elGBC = pos.getBoundingClientRect();
    const containerTop = elGBC.top;
    const elTop = entry.boundingClientRect.top;
    const len = arr.length;
    if (entry.isIntersecting) {
      const el = entry.target;
      const n = el.innerHTML && !isNaN(el?.innerHTML) ? Number(el?.innerHTML) : el?.innerHTML;
      const temp = elToFindFrom;
      const index = temp.indexOf(n);
      if (Math.round(elTop) - 1 <= containerTop || Math.round(elTop) - 1 < 200) {
        this.dateSetter(el?.innerHTML === ' ' ? arr[1]?.innerHTML : arr[index + 1]?.innerHTML, type);
      } else {
        const res = el?.innerHTML === ' ' ? arr[len - 2].innerHTML : arr[index - 1]?.innerHTML;
        this.dateSetter(res, type);
      }
    }
  }
  callBackHelper(entries, arr, elArr, type) {
    entries.forEach(entry => {
      if (entry === undefined || entry === null) {
        return undefined;
      }
      this.helperFunForObservers(entry, arr, elArr, type);
    });
  }
  /**
   * @LifecycleMethod
   */
  connectedCallback() {
    this.setAllArray();
    this.year = calculateYears(this.limits.lower, this.limits.upper);
    this.year.push(this.upperLimitYear);
    const yearSet = new Set(this.year);
    this.year = Array.from(yearSet);
    this.year.push(' ');
    this.year.unshift(' ');
  }
  componentDidLoad() {
    this.initialScrollToActiveValue();
    const options = {
      ampm: {
        root: this.yearSelRefScroll,
        threshold: 0.8,
      },
    };
    /* ----------------------------------
            OBSERVERS callback
    -----------------------------------*/
    const callbackMeridianIO = entries => {
      this.callBackHelper(entries, meridianElements, this.year, 'year');
    };
    /* ----------------------------------
            Set what to Observe on
    -----------------------------------*/
    const ampmObserver = this.yearSelRefScroll.querySelector('.scrollport').querySelectorAll('.cell');
    const meridianElements = this.childElementsYear;
    const ampmObserve = new IntersectionObserver(callbackMeridianIO, options.ampm);
    ampmObserver.forEach(el => {
      ampmObserve.observe(el);
    });
  }
  /**
   * @Watchers
   */
  someFun() {
    console.log(this.ampm);
    if (parseInt(this.ampm) > new Date().getFullYear()) {
      this.nxtYear = this.setAllArray();
    } else if (parseInt(this.ampm) < new Date().getFullYear()) {
      this.prvYear = this.setAllArray();
    } else {
      this.month = this.setAllArray();
      console.log('HERE', this.month);
      return this.month;
    }
  }
  @Watch('ampm')
  emitAMPM() {
    // this.someFun();
    this.setClassSelected(this.childElementsYear, this.ampm);
    this.selectedDate.emit({ monthIndex: this.monthArray.indexOf(this.hour), month: this.hour, year: this.ampm });
  }
  /**
   * Fire every time component get attached to DOM to scroll to  active time
   */
  initialScrollToActiveValue() {
    const yearIndex = this.year.indexOf(new Date().getUTCFullYear()) - 1;
    this.yearSelRefScroll.querySelector('.scrollport').scrollTo({
      top: 33 * yearIndex,
      behavior: 'smooth',
    });
    this.forYEar();
  }
  /**
   *  @return HTML
   */
  forYearWheel = (arr, selection) => {
    return arr.map((time, index) => (
      <div
        id={`year_cell_${index}_id`}
        style={{ opacity: time == selection ? '1' : '.3' }}
        part={`year-cell-${time === this.ampm ? 'selected-part' : 'not-selected-part'}`}
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
  /**
   * --------------------------
   * @returns HTML
   * ----------------------
   */
  activeTimeHighLight() {
    return <div class="highlight border-bottom border-top" id="highlight" part="highlight-active"></div>;
  }
  renderWheel() {
    return (
      <div class="wheels" id="wheel">
        <month-wheel month={this.currentYearCheck === new Date().getFullYear() ? this.month : []}></month-wheel>
        <div class="ampm" id="ampm_id" ref={el => (this.yearSelRefScroll = el as HTMLElement)}>
          <div class="scrollport" id="ampm_scrollport">
            {this.forYearWheel(this.year, this.ampm)}
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
