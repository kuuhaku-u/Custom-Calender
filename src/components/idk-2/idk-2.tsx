import { Component, h, Host, Listen, Prop, Event, EventEmitter } from '@stencil/core';
import { calculateYears, getMonthsBetweenDates } from '../../utils/calendar';
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
  private _allYearBetween;
  private _allMonthsBetween;
  componentDidLoad() {
    this._allYearBetween = calculateYears(this.limits.lower, this.limits.upper);
    this._allYearBetween.push(this.upperLimitYear);
    this._allYearBetween.push(' ');
    this._allYearBetween.unshift(' ');
    this._allMonthsBetween = getMonthsBetweenDates(this.limits.lower, this.limits.upper);
    console.log(this._allMonthsBetween);
  }
  @Listen('selectedDate')
  df(e) {
    this.selectedMonth = e.detail.month;
    this._monthIndex = e.detail.monthIndex + 1;
  }
  renderHeader() {
    return (
      <header onClick={() => this.selectedMonthEvent.emit({ clicked: true, selectedMonth: this.selectedMonth, indexOfMonth: this._monthIndex })}>
        <div style={{ cursor: 'pointer' }}>{this.selectedMonth}</div>
      </header>
    );
  }
  render() {
    return (
      <Host>
        <div class="calendar">
          {this.renderHeader()}
          <div class="dropdown-month-year">
            <idk-22 limits={this.limits} year={this._allYearBetween} currentYear={this.currentYear} />
          </div>
        </div>
      </Host>
    );
  }
}
