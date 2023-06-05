import { Component, h, Host, Prop } from '@stencil/core';
@Component({
  tag: 'idk-2',
  styleUrl: 'idk-2.scss',
  shadow: true,
})
export class Idk2 {
  @Prop() selectedMonth
  render() {
    return (
      <Host>
        <div class="calendar material">
          <header>
            <div style={{ cursor: 'pointer' }}>{this.selectedMonth}</div>
          </header>
          <div class="dropdown-month-year">
            <idk-22 />
          </div>
        </div>
      </Host>
    );
  }
}
