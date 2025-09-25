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
  test,
} from '../utils/index.mjs';

test.describe('Regression test #3433', () => {
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
  test('can merge markdown lists created immediately before existing lists', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('- one');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.type('- two');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">two</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">one</span>
          </li>
        </ul>
      `,
    );
  });
});
