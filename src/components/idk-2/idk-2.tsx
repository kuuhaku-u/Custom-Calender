import { Component, h, Host } from '@stencil/core';
@Component({
  tag: 'idk-2',
  styleUrl: 'idk-2.scss',
  shadow: true,
})
export class Idk2 {
  render() {
    return (
      <Host>
        <div class="calendar material">
          <header>
            <div style={{ backgroundColor: 'red', cursor: 'pointer' }}>month</div>
          </header>
          <div class="dropdown-month-year">
            <idk-22 />
          </div>
        </div>
      </Host>
    );
  }
}
