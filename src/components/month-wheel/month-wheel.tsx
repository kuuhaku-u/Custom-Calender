import { Component, EventEmitter, Host, Prop, State, h, Event, Watch, Listen } from '@stencil/core';
import { getMonthsBetweenDates } from '../../utils/calendar';
@Component({
  tag: 'month-wheel',
  styleUrl: 'month-wheel.scss',
  shadow: true,
})
export class MonthWheel {
  @Prop() month: any[];
  @Prop() locale = 'en-UK';
  @Prop() hasMinMax = false;
  @Prop() limits: any;
  @State() selectedMonth: string;
  @State() ampm: any = new Date().getFullYear();
  @Event() selectedMonthEvent: EventEmitter<{ monthIndex: number; month: string | number; year: string }>;
  @State() selYear: any;
  @State() disableScroll = false;
  monthScrollPortRef?: HTMLElement;
  @Listen('selectedYearEvent', { target: 'document' })
  yearChangeListener(e) {
    if (e.detail.year == ' ' || e.detail.year == undefined) {
      return;
    }
    if (this.hasMinMax) {
      const lowerLimitMonth = getMonthsBetweenDates(this.limits.lower, this.limits.upper, this.locale);
      this.selectedMonth = lowerLimitMonth.filter(el => el.includes(e.detail.year))[0].split(' ')[0];
    } else {
      this.selectedMonth = this.month[1];
    }
    this.selYear = e.detail.year;
  }
  @Watch('selectedMonth')
  emitHour() {
    this.selectedMonthEvent.emit({ monthIndex: this.month.indexOf(this.selectedMonth), month: this.selectedMonth, year: this.ampm });
  }
  initialScrollToActiveValue(monthToScroll) {
    this.monthScrollPortRef?.querySelector('#month_scrollport').scrollTo({
      top: 33 * monthToScroll,
      behavior: 'smooth',
    });
  }
  forMonthWheel = (arr, selection) => {
    return arr.map((time, index) => (
      <div
        aria-label={time}
        style={{ opacity: time == selection ? '1' : '.3' }}
        id={`month_cell_${index}_id`}
        part={`month-cell-${time == this.selectedMonth ? 'selected-part' : 'not-selected-part'}`}
        class={`cell  ${time == selection && 'selected'}${{
          'scroll-item': true,
          'selected': index === this.scrollIndex,
        }}
`}
      >
        {time}
      </div>
    ));
  };
  @State() scrollIndex = 0;
  handleScroll(event: UIEvent) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollIndex = Math.floor(scrollTop / 31.95);
    this.scrollIndex = scrollIndex + 1;
    this.selectedMonth = this.month[this.scrollIndex];
  }
  render() {
    return (
      <Host>
        <slot>
          <div class="month" id="month_id" ref={el => (this.monthScrollPortRef = el as HTMLElement)}>
            <div class="scrollport month" id="month_scrollport" onScroll={(event: UIEvent) => this.handleScroll(event)}>
              {this.forMonthWheel(this.month, this.selectedMonth)}
            </div>
          </div>
        </slot>
      </Host>
    );
  }
}
