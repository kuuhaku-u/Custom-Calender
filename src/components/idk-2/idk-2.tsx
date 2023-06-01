import { Component, Host, h } from '@stencil/core';
import { Calendar } from '../../utils/calendar';
@Component({
  tag: 'idk-2',
  styleUrl: 'idk-2.css',
  shadow: true,
})
export class Idk2 {
  render() {
    return (
      <Host>
        <div class="calendar material">
      <header>
        <span>this.monthNames[date.month - 1]</span>
      </header>
      <div class="dropdown-month-year">
        <div class="scrollport">
          <p class="cell">{new Date("2023-05-12").toLocaleString('en-uk', { month: 'long' })}</p>
          <p class="cell">
            {new Date().toLocaleString('en-UK', {
              month: 'long',
            })}
          </p>
          <p class="cell">{new Date('2023-08-12').toLocaleString('en-uk', { month: 'long' })}</p>
        </div>
        <div class="scrollport">
          <div id="year"></div>
          <div id="year" class="cell">
            {Calendar.getToday().year}
          </div>
          <div id="year" class="cell">
            {Calendar.getToday().month === 12 && Calendar.getToday().year + 1}
          </div>
        </div>
      </div>
    </div>
      </Host>
    );
  }
}
