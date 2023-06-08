import { Component, h, Host, Listen, Prop, Event, EventEmitter } from '@stencil/core';
@Component({
  tag: 'idk-2',
  styleUrl: 'idk-2.scss',
  shadow: true,
})
export class Idk2 {
  @Prop() selectedMonth;
  @Prop() stuff: any;
  @Event() eveIdk: EventEmitter<any>;
  @Listen('selectedDate')
  df(e) {
    this.selectedMonth = e.detail.month;
  }
  render() {
    return (
      <Host>
        <div class="calendar material">
          <header onClick={(() => this.eveIdk.emit(true))}>
            <div style={{ cursor: 'pointer' }}>{this.selectedMonth}</div>
          </header>
          <div class="dropdown-month-year">
            <idk-22 limits={this.stuff} />
          </div>
        </div>
      </Host>
    );
  }
}
