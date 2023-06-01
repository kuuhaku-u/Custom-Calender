import { Component, Host, h } from '@stencil/core';
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
            <span>Month </span>
          </header>
          <div class="day-names">
            Wheel
          </div>
        </div >
      </Host>
    );
  }
}
