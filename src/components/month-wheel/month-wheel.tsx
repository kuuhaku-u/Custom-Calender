import { Component, EventEmitter, Host, Prop, State, h, Event, Watch } from '@stencil/core';
@Component({
  tag: 'month-wheel',
  styleUrl: 'month-wheel.scss',
  shadow: true,
})
export class MonthWheel {
  @Prop() month: any[] = [' ', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ' '];
  @State() hour: string | number = 'June';
  @State() ampm: any = new Date().getFullYear();
  @Event() selectedDate: EventEmitter<{ monthIndex: Number; month: string | number; year: string }>;
  private year = [];
  childElementsMonth: unknown = [];
  childElementsYear: unknown = [];
  monthSelRef?: HTMLElement;
  monthScrollPortRef?: HTMLElement;
  yearSelRef?: HTMLElement;
  yearSelRefScroll?: HTMLElement;
  /**
   *@HelperFunction
   */
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
  componentDidLoad() {
    this.initialScrollToActiveValue();
    const options = {
      h: {
        root: this.monthScrollPortRef,
        threshold: 0.8,
      },
    };
    /* ----------------------------------
            OBSERVERS callback
    -----------------------------------*/
    const callbackHourIO = entries => {
      this.callBackHelper(entries, hourElements, this.month, 'hour');
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
  }
  /**
   * @Watchers
   */
  @Watch('hour')
  emitHour() {
    this.setClassSelected(this.childElementsMonth, this.hour);
    this.selectedDate.emit({ monthIndex: this.month.indexOf(this.hour), month: this.hour, year: this.ampm });
  }
  /**
   * Fire every time component get attached to DOM to scroll to  active time
   */
  initialScrollToActiveValue() {
    const monthIndex = this.month.indexOf(this.hour) - 1;
    this.monthScrollPortRef.querySelector('.scrollport').scrollTo({
      top: 33 * monthIndex,
      behavior: 'smooth',
    });
    this.forMonth();
  }
  /**
   *@HelperFunction
   */
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
  render() {
    console.log(this.month);
    return (
      <Host>
        <slot>
          <div class="hour" id="hour_id" ref={el => (this.monthScrollPortRef = el as HTMLElement)}>
            <div class="scrollport  hour" id="hour_scrollport">
              {this.forMonthWheel(this.month, this.hour)}
            </div>
          </div>
        </slot>
      </Host>
    );
  }
}
