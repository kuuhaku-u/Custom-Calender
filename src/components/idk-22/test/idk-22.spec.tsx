import { newSpecPage } from '@stencil/core/testing';
import { Idk22 } from '../idk-22';

describe('idk-22', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [Idk22],
      html: `<idk-22></idk-22>`,
    });
    expect(page.root).toEqualHtml(`
      <idk-22>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </idk-22>
    `);
  });
});
