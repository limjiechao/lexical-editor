/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  assertHTML,
  focusEditor,
  html,
  initialize,
  IS_MAC,
  test,
} from '../utils/index.mjs';

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isCollab,
      isRichText,
      legacyEvents,
      page,
    }) => {
      const supportsTranspose = IS_MAC && browserName !== 'firefox';

      return (
        supportsTranspose &&
        initialize({
          browserName,
          environment,
          isCollab,
          isRichText,
          legacyEvents,
          page,
          tableHorizontalScroll,
        })
      );
    },
  );

  test('handles "insertTranspose" event from Control+T on MAC', async ({
    page,
    context,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    const supportsTranspose = IS_MAC && browserName !== 'firefox';
    test.skip(!supportsTranspose);

    await focusEditor(page, isCollab);
    await page.keyboard.type('abc');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.down('Control');
    await page.keyboard.press('T');
    await page.keyboard.press('T');
    await page.keyboard.up('Control');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">bca</span>
        </p>
      `,
    );
  });
});
