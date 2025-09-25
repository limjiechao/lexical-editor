/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveLeft,
  moveRight,
  pressBackspace,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  focusEditor,
  html,
  initialize,
  test,
  waitForSelector,
} from '../utils/index.mjs';

test.describe('Regression test #231', () => {
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
  test(`Does not generate segment error when editing empty text nodes`, async ({
    page,
    isCollab,
    isPlainText,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);
    await page.keyboard.type('[foo](https://bar.com)');
    await waitForSelector(page, isCollab, '.PlaygroundEditorTheme__link');
    await moveLeft(page, 3);
    await page.keyboard.type('a');
    await page.keyboard.press('Backspace');
    await moveRight(page, 4);
    await pressBackspace(page, 4);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [0],
      focusOffset: 0,
      focusPath: [0],
    });
  });
});
