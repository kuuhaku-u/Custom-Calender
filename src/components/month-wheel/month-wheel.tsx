import { Component, EventEmitter, Host, Prop, State, h, Event, Watch, Listen } from '@stencil/core';
import { getMonthsBetweenDates } from '../../utils/calendar';
@Component({
  tag: 'month-wheel',
  styleUrl: 'month-wheel.scss',
  shadow: true,
})
/**
 * @NOTES
 *@ONE_myProp_will_be_year
 */
export class MonthWheel {
  @Prop() month: any[];
  @Prop() limits: any;
  @State() hour: string | number = 'June';
  @State() idk: boolean = false;
  @State() ampm: any = new Date().getFullYear();
  @Event() selectedDate: EventEmitter<{ monthIndex: number; month: string | number; year: string }>;
  @State() selYear: any;
  childElementsMonth:any = [];
  monthSelRef?: HTMLElement;
  monthScrollPortRef?: HTMLElement;
  monthScrollPortRefUpper?: HTMLElement;
  monthScrollPortEmpty?: any;
  monthScrollPortRefLower?: HTMLElement;
  @Listen('selectedYEar', { target: 'document' })
  jk(e) {
    this.selYear = e.detail.year;
  }
  setClassSelected(arr: HTMLElement[], val: string | number) {
    try {
      if (arr?.length === 0 || val === undefined) {
        return;
      } else {
        arr.forEach((node: HTMLElement) => {
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
    const cells = this.monthScrollPortRef?.querySelectorAll('.cell');
    if (cells === undefined) {
      return;
    }
    this.childElementsMonth = [];
    this.childElementsMonth = cells;
  }
  forLowerMonth() {
    this.childElementsMonth = [];
    const cells = this.monthScrollPortRefLower?.querySelectorAll('.cell');
    this.childElementsMonth = cells;
  }
  forUpperMonth() {
    this.childElementsMonth = [];
    const cells = this.monthScrollPortRefUpper?.querySelectorAll('.cell');
    this.childElementsMonth = cells;
  }
  dateSetter(data: string | number, type: string) {
    if (type === 'hour') {
      return (this.hour = data);
    } else {
      return (this.ampm = data);
    }
  }
  forLower() {
    return this.month[this.month.length - 2];
  }
  forUpper() {
    return this.month[2];
  }
  helperFunForObservers(entry, arr, elToFindFrom, type) {
    if (!entry || !entry.target) {
      return;
    }
    const pos = this.monthScrollPortRef;
    const elGBC = pos.getBoundingClientRect();
    const containerTop = elGBC.top;
    const elTop = entry.boundingClientRect.top;
    const len = arr?.length;
    if (entry.isIntersecting) {
      const el = entry.target as HTMLElement;
      const n = el.innerHTML && !isNaN((el?.innerHTML as any)) ? Number(el?.innerHTML) : el?.innerHTML;
      const temp = elToFindFrom;
      const index = temp.indexOf(n);
      if (Math.round(elTop) - 1 <= containerTop || Math.round(elTop) - 1 < 200) {
        this.dateSetter(el?.innerHTML === ' ' ? arr[1]?.innerHTML : arr[index + 1]?.innerHTML, type);
      } else {
        let res;
        if (this.selYear < 2023) {
          this.month.length;
          res = el?.innerHTML === ' ' ? this.forLower() : arr[index - 1]?.innerHTML;
        } else if (this.selYear > 2023) {
          res = el?.innerHTML === ' ' ? this.forUpper() : arr[index - 1]?.innerHTML;
        } else {
          res = el?.innerHTML === ' ' ? arr[len - 2].innerHTML : arr[index - 1]?.innerHTML;
        }
        this.dateSetter(res, type);
      }
    }
  }
  callBackHelper(entries: IntersectionObserverEntry[], arr: HTMLElement[], elArr: any[], type: string) {
    entries.forEach((entry: IntersectionObserverEntry | null) => {
      if (entry === undefined || entry === null) {
        return undefined;
      }
      this.helperFunForObservers(entry, arr, elArr, type);
    });
  }
  componentDidLoad() {
    this.initialScrollToActiveValue();
  }
  @Watch('hour')
  emitHour() {
    this.selectedDate.emit({ monthIndex: this.month.indexOf(this.hour), month: this.hour, year: this.ampm });
  }
  initialScrollToActiveValue() {
    const monthIndex = this.month.indexOf(this.hour) - 1;
    this.monthScrollPortRef?.querySelector('.scrollport').scrollTo({
      top: 33 * monthIndex,
      behavior: 'smooth',
    });
    this.forMonth();
  }
  forMonthWheel = (arr: any[], selection: string | number) => {
    return arr.map((time, index) => (
      <div
        aria-label={time}
        style={{ opacity: time == selection ? '1' : '.3' }}
        id={`hour_cell_${index}_id`}
        part={`hour-cell-${time == this.hour ? 'selected-part' : 'not-selected-part'}`}
        class={`cell  ${time == selection && 'selected'} ${time === 'XX' && 'hide'} ${{
          'scroll-item': true,
          'selected': index === this.scrollIndex,
        }}
`}
        ref={el => {
          if (time !== selection) {
            return;
          }
          this.monthSelRef = el;
        }}
      >
        {time}
      </div>
    ));
  };
  @State() scrollIndex: number = 0;
  handleScroll(event: UIEvent) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollIndex = Math.floor(scrollTop / 31.95);
    this.scrollIndex = scrollIndex + 1;
    this.hour = this.month[this.scrollIndex];
  }
  forYearWheel = (arr, selection) => {
    return arr.map((time, index) => (
      <div
        id={`month${index}_id`}
        style={{ opacity: time == selection ? '1' : '.3' }}
        part={`y-cell-${time === this.ampm ? 'selected-part' : 'not-selected-part'}`}
        aria-label={time}
        class={`cell  ${time === selection && 'selected'} `}
      >
        {time}
      </div>
    ));
  };
  render() {
    if (!this.isConnected) {
      return null; // Don't render anything if disconnected
    }
    return (
      <Host>
        <slot>
          <div class="hour" id="hour_id" ref={el => (this.monthScrollPortEmpty = el as HTMLElement)}>
            <div class="scrollport  hour" id="hour_scrollport" onScroll={(event: UIEvent) => this.handleScroll(event)}>
              {this.forMonthWheel(this.month, this.hour)}
            </div>
          </div>
        </slot>
      </Host>
    );
  }
}
