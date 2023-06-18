import { Component, EventEmitter, Host, Listen, Prop, State, h, Event } from '@stencil/core';
@Component({
  tag: 'wheel-container',
  styleUrl: 'idk-2.scss',
  shadow: true,
})
export class WheelContainer {
  @Prop() selectedMonth;
  @Prop() upperYear;
  @Prop() locale = 'en-NZ';
  @Prop() calendarEndDate = '2050-12-12';
  @Prop() calendarStartDate = '2000-01-01';
  @Prop() hasMinMax = true;
  @Prop() lowerLimitYear;
  @Prop() currentYear = new Date().getFullYear();
  @Prop() limits: any;
  @Event() closeWheel: EventEmitter<any>;
  @Event() closeWheel2: EventEmitter<any>;
  private _monthIndex = 0;
  @State() currentMonth = new Date().toLocaleString(this.locale, { month: 'long' });
  @Listen('selectedDate123')
  selectedDateListener(e) {
    this._monthIndex = e.detail.monthIndex + 1;
    this.currentMonth = e.detail.month;
    this.closeWheel.emit({ selectedMonth: this.currentMonth, indexOfMonth: this._monthIndex, year: e.detail.year });
  }
  handleClick() {
    this.closeWheel2.emit(true);
  }
  renderHeader() {
    return (
      <header onClick={() => this.handleClick()}>
        <div style={{ cursor: 'pointer' }}>{this.currentMonth}</div>
      </header>
    );
  }
  render() {
    return (
      <Host>
        <div class="calendar">
          {this.renderHeader()}
          <div class="dropdown-month-year" style={{cursor:"pointer"}}>
            <year-wheel
              calendarEndDate={this.calendarEndDate}
              calendarStartDate={this.calendarStartDate}
              locale={this.locale}
              hasMixMAx={this.hasMinMax}
              upperLimitYear={this.upperYear}
              limits={this.limits}
              currentYear={this.currentYear}
              currentMonth={new Date().toLocaleString('default', { month: 'long' })}
            />
          </div>
        </div>
      </Host>
    );
  }
}
