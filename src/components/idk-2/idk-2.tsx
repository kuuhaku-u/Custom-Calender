import { Component, h, Host, Listen, Prop, Event, EventEmitter, State } from '@stencil/core';
@Component({
  tag: 'idk-2',
  styleUrl: 'idk-2.scss',
  shadow: true,
})
export class Idk2 {
  @Prop() selectedMonth;
  @Prop() upperLimitYear;
  @Prop() lowerLimitYear;
  @Prop() currentYear = new Date().getFullYear();
  @Prop() limits: any;
  @Event() selectedMonthEvent: EventEmitter<any>;
  private _monthIndex = 0;
  @State() _currentMonth = new Date().toLocaleString('default', { month: 'long' });
  @Listen('selectedDate')
  df(e) {
    this._currentMonth = e.detail.month;
    this._monthIndex = e.detail.monthIndex + 1;
  }
  componentDidLoad() {
    console.log('Component has been rendered');
  }
  renderHeader() {
    return (
      <header onClick={() => this.selectedMonthEvent.emit({ clicked: true, selectedMonth: this.selectedMonth, indexOfMonth: this._monthIndex })}>
        <div style={{ cursor: 'pointer' }}>{this._currentMonth}</div>
      </header>
    );
  }
  render() {
    return (
      <Host>
        <div class="calendar">
          {this.renderHeader()}
          <div class="dropdown-month-year">
            <idk-22 limits={this.limits} currentYear={this.currentYear} currentMonth={new Date().toLocaleString('default', { month: 'long' })} />
          </div>
        </div>
      </Host>
    );
  }
}
