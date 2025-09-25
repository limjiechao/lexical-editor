/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  click,
  dragMouse,
  focusEditor,
  initialize,
  mouseMoveToSelector,
  selectFromInsertDropdown,
  selectorBoundingBox,
  test,
  waitForSelector,
} from '../utils/index.mjs';

async function toggleBulletList(page, isCollab) {
  await click(page, isCollab, '.block-controls');
  await click(page, isCollab, '.dropdown .icon.bullet-list');
}
test.describe('Regression test #5251', () => {
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isCollab,
      isRichText,
      legacyEvents,
      page,
    }) =>
      initialize({
        browserName,
        environment,
        isCollab,
        isRichText,
        legacyEvents,
        page,
        tableHorizontalScroll,
      }),
  );
  test(`Element node in the middle of a bullet list and selecting doesn't crash`, async ({
    page,
    isCollab,
    isPlainText,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        if (
          msg.text().includes('error #68') ||
          msg.text().includes('getNodesBetween: ancestor is null')
        ) {
          test.fail();
        }
      }
    });

    await toggleBulletList(page, isCollab);
    await page.keyboard.type('one');
    await page.keyboard.press('Enter');
    await page.keyboard.type('two');
    await page.keyboard.press('Enter');
    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');
    await waitForSelector(page, isCollab, 'hr');
    await page.keyboard.type('three');
    await page.keyboard.press('Enter');
    await mouseMoveToSelector(page, isCollab, 'li:has-text("one")');
    await page.mouse.down();
    await dragMouse(
      page,
      await selectorBoundingBox(page, isCollab, 'li:has-text("one")'),
      await selectorBoundingBox(page, isCollab, 'li:has-text("three")'),
      {positionEnd: 'end', positionStart: 'middle'},
    );
  });
});
