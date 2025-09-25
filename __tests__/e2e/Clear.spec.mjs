/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  assertHTML,
  click,
  focusEditor,
  html,
  initialize,
  test,
} from '../utils/index.mjs';

test.describe('Clear', () => {
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
  test(`can clear the editor`, async ({page, isCollab, browserName}) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('foo');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">foo</span>
        </p>
      `,
    );

    await click(page, isCollab, '.action-button.clear');

    await click(page, isCollab, 'button:has-text("Cancel")');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">foo</span>
        </p>
      `,
    );

    await click(page, isCollab, '.action-button.clear');

    await click(page, isCollab, 'button:has-text("Clear")');
    await page.keyboard.type('bar');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">bar</span>
        </p>
      `,
    );
  });
});
