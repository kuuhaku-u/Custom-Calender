import { newE2EPage } from '@stencil/core/testing';

describe('idk-22', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<idk-22></idk-22>');

    const element = await page.find('idk-22');
    expect(element).toHaveClass('hydrated');
  });
});
