import { Component, EventEmitter, Host, Prop, State, Watch, h, Event } from '@stencil/core';
@Component({
  tag: 'idk-22',
  styleUrl: 'idk-22.scss',
  shadow: true,
})
export class Idk22 {
  @Prop({ mutable: true }) hrFormat24 = false;
  @Prop({ mutable: true }) step = 15;
  @State() startTime: string | undefined = '2:30 PM';
  @State() hr: any[];
  @State() hr24Format: any[] = [' ', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, ' '];
  @State() hr12Format: any[] = [' ', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', ' '];
  @State() m: any[] = [];
  @State() startNewTime: { selectedHour: number | string; selectedMinute: number | string; selectedAMPM: string } = {
    selectedHour: 5,
    selectedMinute: 30,
    selectedAMPM: 'AM',
  };
  @State() hour: string | number;
  @State() min: string | number;
  @State() ampm: string;
  @Event() selectedTimeEmitter: EventEmitter<{ hour: string | number; minute: string | number; meridian: string }>;
  meridian = [' ', new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString(), ' '];
  childElementsHour: unknown = [];
  childElementsMinutes: unknown = [];
  childElementsAMPM: unknown = [];
  hourSelRef?: HTMLElement;
  hourScrollPortRef?: HTMLElement;
  minSelRef?: HTMLElement;
  minScrollPortRef?: HTMLElement;
  ampmSelRef?: HTMLElement;
  ampmScrollPortRef?: HTMLElement;
  /**
   *@HelperFunction
   */
  splitData() {
    if (this.startTime === undefined) {
      return;
    }
    const meridian = this.startTime.split(' ');
    const getTimeMin = meridian[0].split(':');
    return [...getTimeMin, meridian[1]];
  }
  hourFormat(): any[] {
    return this.hrFormat24 ? this.hr24Format : this.hr12Format.slice(6, 9);
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
  forHour() {
    const cells = this.hourScrollPortRef.querySelectorAll('.cell');
    this.childElementsHour = cells;
  }
  forMinutes() {
    const cells = this.minScrollPortRef.querySelectorAll('.cell');
    this.childElementsMinutes = cells;
  }
  forAMPM() {
    const cells = this.ampmScrollPortRef.querySelectorAll('.cell');
    this.childElementsAMPM = cells;
  }
  timeSetter(data, type) {
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
    const pos = this.hourScrollPortRef;
    const elGBC = pos.getBoundingClientRect();
    const containerTop = elGBC.top;
    const elTop = entry.boundingClientRect.top;
    const len = arr.length;
    let index;
    if (entry.isIntersecting) {
      const el = entry.target;
      const n = el.innerHTML && !isNaN(el.innerHTML) ? Number(el.innerHTML) : el.innerHTML;
      const temp = elToFindFrom;
      index = temp.indexOf(n);
      if (type === 'meridian') {
        if (elTop > containerTop) {
          el.innerHTML === ' ' || el.innerHTML === '2023' ? this.timeSetter('2024', type) : this.timeSetter('2024', type);
        } else {
          el.innerHTML === ' ' || el.innerHTML === '2024' ? this.timeSetter('2023', type) : this.timeSetter('2023', type);
        }
      } else {
        if (elTop <= containerTop) {
          this.timeSetter(arr[index + 1].innerHTML === ' ' ? '1' : arr[index + 1].innerHTML, type);
        } else {
          const res = isNaN(parseInt(el.innerHTML)) ? arr[len - 2].innerHTML : arr[index < len - 1 && index - 1].innerHTML;
          // }
          this.timeSetter(res, type);
        }
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
    const st = this.step === 0 ? 60 : this.step;
    for (let i = 0; i < 60 / st; i++) {
      this.m[i] = this.step * i;
    }
    const emptyStr = '';
    this.m.push(emptyStr);
    this.m = Array.from(new Set(this.m));
    this.m.unshift(emptyStr);
    const arr = this.hourFormat();
    arr.push(emptyStr);
    arr.unshift(emptyStr);
    this.hr = arr;
    // ---set initial time
    const initialTime = this.splitData();
    if (initialTime !== undefined) {
      this.startNewTime = {
        selectedHour: Number(initialTime[0]),
        selectedMinute: Number(initialTime[1]),
        selectedAMPM: (this.ampm = initialTime[2]),
      };
    }
  }
  componentDidLoad() {
    this.initialScrollToActiveValue();
    const options = {
      h: {
        root: this.hourScrollPortRef,
        threshold: 1,
      },
      m: {
        root: this.minScrollPortRef,
        threshold: 1,
      },
      ampm: {
        root: this.ampmScrollPortRef,
        threshold: 1,
      },
    };
    /* ----------------------------------
            OBSERVERS callback
    -----------------------------------*/
    const callbackHourIO = entries => {
      this.callBackHelper(entries, hourElements, this.hr, 'hour');
    };
    const callbackMeridianIO = entries => {
      this.callBackHelper(entries, meridianElements, this.meridian, 'meridian');
    };
    /* ----------------------------------
            Set what to Observe on
    -----------------------------------*/
    const hourElements = this.childElementsHour;
    const hourObserve = this.hourScrollPortRef.querySelector('.scrollport').querySelectorAll('.cell');
    const hourObserver = new IntersectionObserver(callbackHourIO, options.h);
    hourObserve.forEach(el => {
      hourObserver.observe(el);
    });
    const ampmObserver = this.ampmScrollPortRef.querySelectorAll('.cell');
    const meridianElements = this.childElementsAMPM;
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
    this.setClassSelected(this.childElementsHour, this.hour);
    console.log('Month', this.hour);
    this.selectedTimeEmitter.emit({ hour: this.hour, minute: this.min, meridian: this.ampm });
  }
  @Watch('ampm')
  emitAMPM() {
    this.setClassSelected(this.childElementsAMPM, this.ampm);
    console.log('Year', this.ampm);
    this.selectedTimeEmitter.emit({ hour: this.hour, minute: this.min, meridian: this.ampm });
  }
  /**
   * Fire every time component get attached to DOM to scroll to  active time
   */
  initialScrollToActiveValue() {
    this.ampmSelRef?.textContent === '2023'
      ? null
      : this.ampmScrollPortRef.scrollTo({
          top: 30 * 4,
          behavior: 'smooth',
        });
    const hourIndex = this.hr.indexOf(this.hourSelRef.textContent);
    console.log(hourIndex,"INDEX");
    this.hourScrollPortRef.querySelector('.scrollport').scrollTo({
      top:  33 * hourIndex+2,
      behavior: 'smooth',
    });
    this.forHour();
    this.forAMPM();
  }
  /**
   *  @return HTML
   */
  forMeridianWheel = (arr, selection) =>
    arr.map((time, index) => (
      <div
        id={`meridian_cell_${index}_id`}
        part={`meridian-cell-${time === this.ampm ? 'selected-part' : 'not-selected-part'}`}
        aria-label={time}
        class={`cell  ${time === selection && 'selected'}  ${time === 'X1' || time === 'X2' ? 'hide' : ''} `}
        ref={el => {
          if (time !== selection) {
            return;
          }
          this.ampmSelRef = el as HTMLElement;
        }}
      >
        {time}
      </div>
    ));
  forHrWheel = (arr, selection) =>
    arr.map((time, index) => (
      <div
        aria-label={time}
        id={`hour_cell_${index}_id`}
        part={`hour-cell-${time == this.hour ? 'selected-part' : 'not-selected-part'}`}
        class={`cell   ${time == selection && 'selected'} ${time === ' ' && 'hide'} `}
        ref={el => {
          if (time !== selection) {
            return;
          }
          this.hourSelRef = el as HTMLElement;
        }}
      >
        {time}
      </div>
    ));
  forMinWheel = (arr, selection) =>
    arr.map((time, index) => (
      <div
        id={`min_cell_${index}_id`}
        part={`min-cell-${time == this.min ? 'selected-part' : 'not-selected-part'}`}
        aria-label={time}
        class={`cell  ${time == selection && 'selected'} ${time === ' ' && 'hide'} `}
        ref={el => {
          if (time !== selection) {
            return;
          }
          this.minSelRef = el as HTMLElement;
        }}
      >
        {time}
      </div>
    ));
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
        <div class="hour" id="hour_id" ref={el => (this.hourScrollPortRef = el as HTMLElement)}>
          <div class="scrollport  hour" id="hour_scrollport">
            {this.forHrWheel(this.hr, "June")}
          </div>
        </div>
        <div class="ampm" id="ampm_id" style={{ display: this.hrFormat24 ? 'none' : '' }}>
          <div class="scrollport" id="ampm_scrollport" ref={el => (this.ampmScrollPortRef = el as HTMLElement)}>
            {this.forMeridianWheel(this.meridian, this.startNewTime.selectedAMPM)}
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
