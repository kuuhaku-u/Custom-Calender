import { newSpecPage } from '@stencil/core/testing';
import { MonthWheel } from '../month-wheel';

describe('month-wheel', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MonthWheel],
      html: `<month-wheel></month-wheel>`,
    });
    expect(page.root).toEqualHtml(`
      <month-wheel>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </month-wheel>
    `);
  });
});
