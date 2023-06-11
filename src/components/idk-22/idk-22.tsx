import { Component, EventEmitter, Host, State, Watch, h, Event, Prop } from '@stencil/core';
@Component({
  tag: 'idk-22',
  styleUrl: 'idk-22.scss',
  shadow: true,
})
export class Idk22 {
  @Prop() limits: any;
  @Prop() currentMonth = 'June';
  @State() monthArray: any[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  @State() month: any[];
  @State() hour: string | number;
  @State() ampm: string;
  @Event() selectedDate: EventEmitter<{ monthIndex: Number; month: string | number; year: string }>;
  year = [' ', new Date().getFullYear().toString(), ' '];
  childElementsMonth: unknown = [];
  childElementsYear: unknown = [];
  monthSelRef?: HTMLElement;
  monthScrollPortRef?: HTMLElement;
  yearSelRef?: HTMLElement;
  yearSelRefScroll?: HTMLElement;
  /**
   *@HelperFunction
   */
  monthArrayReturn(): any[] {
    return this.monthArray;
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
  forMonth() {
    const cells = this.monthScrollPortRef.querySelectorAll('.cell');
    this.childElementsMonth = cells;
  }
  forYEar() {
    const cells = this.yearSelRefScroll.querySelectorAll('.cell');
    this.childElementsYear = cells;
  }
  dateSetter(data, type) {
    if (type === 'hour') {
      return (this.hour = data);
    } else {
      return (this.ampm = data);
    }
  }
  helperFunForObservers(entry, arr, elToFindFrom, type) {
    if (!entry || !entry.target) {
      return;
    }
    const pos = this.monthScrollPortRef;
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
        this.dateSetter(el?.innerHTML === '' ? arr[1]?.innerHTML : arr[index + 1]?.innerHTML, type);
      } else {
        const res = el?.innerHTML === ''  ? arr[len-2]?.innerHTML : arr[index - 1]?.innerHTML;
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
    const emptyStr = '';
    const arr = this.monthArrayReturn().slice(this.limits.lower-1 , this.limits.upper);
    arr.push(emptyStr);
    arr.unshift(emptyStr);
    this.month = arr;
  }
  componentDidLoad() {
    this.initialScrollToActiveValue();
    const options = {
      h: {
        root: this.monthScrollPortRef,
        threshold: 0.8,
      },
      ampm: {
        root: this.yearSelRefScroll,
        threshold: 0.8,
      },
    };
    /* ----------------------------------
            OBSERVERS callback
    -----------------------------------*/
    const callbackHourIO = entries => {
      this.callBackHelper(entries, hourElements, this.month, 'hour');
    };
    const callbackMeridianIO = entries => {
      this.callBackHelper(entries, meridianElements, this.year, 'year');
    };
    /* ----------------------------------
            Set what to Observe on
    -----------------------------------*/
    const hourElements = this.childElementsMonth;
    const hourObserve = this.monthScrollPortRef.querySelector('.scrollport').querySelectorAll('.cell');
    const hourObserver = new IntersectionObserver(callbackHourIO, options.h);
    hourObserve.forEach(el => {
      hourObserver.observe(el);
    });
    const ampmObserver = this.yearSelRefScroll.querySelectorAll('.cell');
    const meridianElements = this.childElementsYear;
    const ampmObserve = new IntersectionObserver(callbackMeridianIO, options.ampm);
    ampmObserver.forEach(el => {
      ampmObserve.observe(el);
    });
  }
  /**
   * @Watchers
   */
  @Watch('hour')
  emitHour() {
    this.setClassSelected(this.childElementsMonth, this.hour);
    this.selectedDate.emit({ monthIndex: this.monthArray.indexOf(this.hour), month: this.hour, year: this.ampm });
  }
  @Watch('ampm')
  emitAMPM() {
    this.setClassSelected(this.childElementsYear, this.ampm);
    this.selectedDate.emit({ monthIndex: this.monthArray.indexOf(this.hour), month: this.hour, year: this.ampm });
  }
  /**
   * Fire every time component get attached to DOM to scroll to  active time
   */
  initialScrollToActiveValue() {
    this.yearSelRef?.textContent === new Date().getUTCFullYear().toString()
      ? null
      : this.yearSelRefScroll.scrollTo({
          top: 30 * 4,
          behavior: 'smooth',
        });
    this.monthScrollPortRef.querySelector('.scrollport').scrollTo({
      top: 33 * 1,
      behavior: 'smooth',
    });
    this.forMonth();
    this.forYEar();
  }
  /**
   *  @return HTML
   */
  forYearWheel = (arr, selection) =>
    arr.map((time, index) => (
      <div
        id={`meridian_cell_${index}_id`}
        part={`year-cell-${time === this.ampm ? 'selected-part' : 'not-selected-part'}`}
        aria-label={time}
        class={`cell  ${time === selection && 'selected'}  ${time === 'X1' || time === 'X2' ? 'hide' : ''} `}
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
  forMonthWheel = (arr, selection) => {
    return arr.map((time, index) => (
      <div
        aria-label={time}
        style={{ opacity: time == selection ? '1' : '.3' }}
        id={`hour_cell_${index}_id`}
        part={`hour-cell-${time == this.hour ? 'selected-part' : 'not-selected-part'}`}
        class={`cell  ${time == selection && 'selected'} ${time === ' ' && 'hide'} `}
        ref={el => {
          if (time !== selection) {
            return;
          }
          this.monthSelRef = el as HTMLElement;
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
        <div class="hour" id="hour_id" ref={el => (this.monthScrollPortRef = el as HTMLElement)}>
          <div class="scrollport  hour" id="hour_scrollport">
            {this.forMonthWheel(this.month, this.hour === undefined ? 'June' : this.hour)}
          </div>
        </div>
        <div class="ampm" id="ampm_id">
          <div class="scrollport" id="ampm_scrollport" ref={el => (this.yearSelRefScroll = el as HTMLElement)}>
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
