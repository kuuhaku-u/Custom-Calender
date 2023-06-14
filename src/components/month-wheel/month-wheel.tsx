import { Component, EventEmitter, Host, Prop, State, h, Event, Watch, Listen } from '@stencil/core';
import { getMonthsBetweenDates } from '../../utils/calendar';
@Component({
  tag: 'month-wheel',
  styleUrl: 'month-wheel.scss',
  shadow: true,
})
export class MonthWheel {
  @Prop() month: any[];
  // private _monthArr: any[] = [' ', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ' '];
  @State() hour: string | number = 'June';
  @Prop() limits: any;
  @State() idk: boolean = false;
  @State() ampm: any = new Date().getFullYear();
  @Event() selectedDate: EventEmitter<{ monthIndex: Number; month: string | number; year: string }>;
  @State() selYear: any;
  @State() disableScroll = false;
  childElementsMonth: unknown = [];
  monthSelRef?: HTMLElement;
  monthScrollPortRef?: HTMLElement;
  setAllArray() {
    this.month = getMonthsBetweenDates(this.limits.lower, this.limits.upper)
      .filter(e => e.includes(this.ampm))
      .map(e => e.split(' ')[0].toString());
    this.month.push(' ');
    this.month.unshift(' ');
    return this.month;
  }
  someFun() {
    if (parseInt(this.ampm) > new Date().getFullYear()) {
      this.month = this.setAllArray();
      const desiredLength = 13;
      while (this.month.length < desiredLength) {
        this.month.push(' ');
      }
      this.month.push(' ');
    } else if (parseInt(this.ampm) < new Date().getFullYear()) {
      this.month = this.setAllArray();
      const desiredLength = 13;
      while (this.month.length < desiredLength) {
        this.month.unshift(' ');
      }
      this.month.unshift(' ');
    } else  if (this.ampm == 2023){
      this.month = this.setAllArray();
      return this.month;
    }
  }
  @Listen('selectedYEar', { target: 'document' })
  id(e) {
    this.selYear = e.detail.year;
    // this.someFun();
    console.log(this.month);
    if (this.selYear == ' ') {
      return;
    }
    if (this.selYear < 2023) {
      this.hour = 'December';
      this.initialScrollToActiveValue();
    }
    if (this.selYear > 2024) {
      this.hour = 'January';
      this.initialScrollToActiveValue();
    } else {
      this.hour = 'June';
      this.initialScrollToActiveValue();
    }
  }
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
    this.idk = data === ' ' ? true : false;
    if (type === 'hour') {
      return (this.hour = data);
    } else {
      return (this.ampm = data);
    }
  }
  forLower() {
    this.month = this.month.filter(e => e !== ' ');
    this.month.push(' ');
    this.month.unshift(' ');
    return this.month[this.month.length - 2];
  }
  forUpper() {
    this.disableScroll = true;
    this.month = this.month.filter(e => e !== ' ');
    this.month.push(' ');
    this.month.unshift(' ');
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
    const len = arr.length;
    if (entry.isIntersecting) {
      const el = entry.target;
      const n = el.innerHTML && !isNaN(el?.innerHTML) ? Number(el?.innerHTML) : el?.innerHTML;
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
    const callbackHourIO = entries => {
      this.callBackHelper(entries, hourElements, this.month, 'hour');
    };
    // handleKeyDown =/
    document.addEventListener('onkeydown', (event: KeyboardEvent) => {
      if (this.disableScroll && event.key !== 'ArrowDown') {
        event.preventDefault();
        return;
      }
      // if (this.disableScroll && event.key === 'ArrowDown') {
      //   event.preventDefault();
      //   return;
      // }
      return;
    });
    const hourElements = this.childElementsMonth;
    const hourObserve = this.monthScrollPortRef.querySelector('.scrollport').querySelectorAll('.cell');
    const hourObserver = new IntersectionObserver(callbackHourIO, options.h);
    hourObserve.forEach(el => {
      hourObserver.observe(el);
    });
  }
  disconnectedCallBack() {
    // ...
    document.removeEventListener('keydown', (event: KeyboardEvent) => {
      if (this.disableScroll) {
        event.preventDefault();
        return;
      }
    });
  }
  /**
   * @Watchers
   */
  @Watch('hour')
  emitHour() {
    this.selectedDate.emit({ monthIndex: this.month.indexOf(this.hour), month: this.hour, year: this.ampm });
  }
  initialScrollToActiveValue() {
    const monthIndex = this.month.indexOf(this.hour) - 1;
    this.monthScrollPortRef.querySelector('.scrollport').scrollTo({
      top: 33 * monthIndex,
      behavior: 'smooth',
    });
    this.forMonth();
  }
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
    return (
      <Host>
        <slot>
          <div class="hour" id="hour_id" ref={el => (this.monthScrollPortRef = el as HTMLElement)}>
            <div class="scrollport  hour" style={{ overFlow: this.disableScroll ? 'hidden' : 'scroll' }} id="hour_scrollport">
              {this.forMonthWheel(this.month, this.hour)}
            </div>
          </div>
        </slot>
      </Host>
    );
  }
}
