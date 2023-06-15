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
  @Prop() month: any[] = [' ', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ' '];
  @State() hour: string | number = 'June';
  @Prop() limits: any;
  @State() idk: boolean = false;
  private isConnected: boolean = true;
  @State() ampm: any = new Date().getFullYear();
  @Event() selectedDate: EventEmitter<{ monthIndex: number; month: string | number; year: string }>;
  @State() selYear: any;
  childElementsMonth:any = [];
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
  // @Watch('ampm')
  // handlePropChange(newValue: string, oldValue: string) {
  //   if (newValue === ' ') {
  //     this.disconnect();
  //     return;
  //   }else{

  //   this.reconnect();
  //   }
  // }
  disconnect() {
    if (this.isConnected) {
      // Disconnect logic
      // Example: Remove event listeners or clean up resources
      // ...
      this.isConnected = false;
      // Remove component from the DOM
      this.removeComponent();
    }
  }
  reconnect() {
    if (!this.isConnected) {
      // Reconnect logic
      // Example: Add event listeners or initialize resources
      // ...
      this.isConnected = true;
      // Reattach component to the DOM
      const hostElement = document.createElement('month-wheel');
      document.body.appendChild(hostElement);
    }
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
    } else if (this.ampm == 2023) {
      this.month = this.setAllArray();
      return this.month;
    }
  }
  @Listen('selectedYEar', { target: 'document' })
  id(e: CustomEvent) {
    this.selYear = e.detail.year;
    if (this.selYear == ' ') {
      return;
    }
    // if (e.detail !== 2023) {
    this.disconnect();
    // } else {
    this.reconnect();
    // }
    this.selYear = e.detail.year;
    if (this.selYear < 2023) {
      this.month = [];
      this.month = this.setAllArray();
      const desiredLength = 13;
      while (this.month.length < desiredLength) {
        this.month.unshift(' ');
      }
      this.month.unshift(' ');
      this.hour = 'December';
      this.initialScrollToActiveValue();
    }
    if (this.selYear > 2024) {
      this.month = [];
      this.month = this.setAllArray();
      const desiredLength = 13;
      while (this.month.length < desiredLength) {
        this.month.push(' ');
      }
      this.hour = 'January';
      this.initialScrollToActiveValue();
    } else {
      this.hour = 'June';
      this.initialScrollToActiveValue();
      // return this.month;
    }
  }
  setClassSelected(arr: HTMLElement[], val: string | number) {
    try {
      if (arr.length === 0 || val === undefined) {
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
    const cells = this.monthScrollPortRef.querySelectorAll('.cell');
    this.childElementsMonth = cells;
  }
  dateSetter(data: string | number, type: string) {
    if (type === 'hour') {
      return (this.hour = data);
    } else {
      return (this.ampm = data);
    }
  }
  helperFunForObservers(entry: IntersectionObserverEntry | null, arr: HTMLElement[], elToFindFrom: any[], type: string) {
    if (!entry || !entry.target) {
      return;
    }
    const pos = this.monthScrollPortRef;
    const elGBC = pos.getBoundingClientRect();
    const containerTop = elGBC.top;
    const elTop = entry.boundingClientRect.top;
    const len = arr.length;
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
    const options = {
      h: {
        root: this.monthScrollPortRef,
        threshold: 0.8,
      },
    };
    const callbackHourIO = (entries: IntersectionObserverEntry[]) => {
      this.callBackHelper(entries, hourElements, this.month, 'hour');
    };
    const hourElements = this.childElementsMonth;
    const hourObserve = this.monthScrollPortRef.querySelector('.scrollport').querySelectorAll('.cell');
    const hourObserver = new IntersectionObserver(callbackHourIO, options.h);
    hourObserve.forEach((el: HTMLElement) => {
      hourObserver.observe(el);
    });
  }
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
  forMonthWheel = (arr: any[], selection: string | number) => {
    return arr.map((time, index) => (
      <div
        aria-label={time}
        style={{ opacity: time == selection ? '1' : '.3' }}
        id={`hour_cell_${index}_id`}
        part={`hour-cell-${time == this.hour ? 'selected-part' : 'not-selected-part'}`}
        class={`cell ${time == selection && 'selected'} ${time === ' ' && 'hide'}`}
        ref={(el: HTMLElement) => {
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
  cleanup() {
    // Cleanup logic
    // Example: Clean up any remaining resources or perform final actions
    // ...
  }
  removeComponent() {
    const hostElement = document.querySelector('wheel-month');
    if (hostElement) {
      hostElement.parentNode.removeChild(hostElement);
    }
  }
  render() {
    if (!this.isConnected) {
      return null; // Don't render anything if disconnected
    }
    return (
      <Host>
        <slot>
          <div class="hour" id="hour_id" ref={(el: HTMLElement) => (this.monthScrollPortRef = el)}>
            <div class="scrollport hour" id="hour_scrollport">
              {this.forMonthWheel(this.month, this.hour)}
            </div>
          </div>
        </slot>
      </Host>
    );
  }
}
