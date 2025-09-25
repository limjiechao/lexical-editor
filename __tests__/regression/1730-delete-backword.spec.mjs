/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {deleteBackward, moveToLineEnd} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  focusEditor,
  html,
  initialize,
  IS_MAC,
  test,
} from '../utils/index.mjs';

test.describe('Regression test #1730', () => {
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
  test(`Can delete backward with keyboard`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    if (!IS_MAC) {
      // Do Windows/Linux have equivalent shortcuts?
      return;
    }
    await focusEditor(page, isCollab);

    await page.keyboard.type('hello world');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">hello world</span>
        </p>
      `,
    );

    await moveToLineEnd(page);
    await deleteBackward(page);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">hello worl</span>
        </p>
      `,
    );
  });
});
