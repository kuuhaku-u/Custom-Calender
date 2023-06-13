import { newE2EPage } from '@stencil/core/testing';

describe('month-wheel', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<month-wheel></month-wheel>');

    const element = await page.find('month-wheel');
    expect(element).toHaveClass('hydrated');
  });
});
