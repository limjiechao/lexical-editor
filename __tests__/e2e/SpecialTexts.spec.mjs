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
  waitForSelector,
} from '../utils/index.mjs';

test.describe('Special Text', () => {
  test.use({shouldAllowHighlightingWithBrackets: true});
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isCollab,
      isRichText,
      legacyEvents,
      page,
      shouldAllowHighlightingWithBrackets,
    }) =>
      initialize({
        browserName,
        environment,
        isCollab,
        legacyEvents,
        page,
        shouldAllowHighlightingWithBrackets,
        tableHorizontalScroll,
      }),
  );
  test('should handle a single special text', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await page.keyboard.type('[MLH Fellowship]');
    await waitForSelector(
      page,
      isCollab,
      '.PlaygroundEditorTheme__specialText',
    );

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span
            class="PlaygroundEditorTheme__specialText"
            data-lexical-text="true">
            MLH Fellowship
          </span>
        </p>
      `,
    );
  });
  test('should handle multiple special texts', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await page.keyboard.type('[MLH Fellowship] [MLH Fellowship]');
    await waitForSelector(
      page,
      isCollab,
      '.PlaygroundEditorTheme__specialText',
    );
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span
            class="PlaygroundEditorTheme__specialText"
            data-lexical-text="true">
            MLH Fellowship
          </span>
          <span data-lexical-text="true"></span>
          <span
            class="PlaygroundEditorTheme__specialText"
            data-lexical-text="true">
            MLH Fellowship
          </span>
        </p>
      `,
    );
  });

  test('should not work when the option to use brackets for highlighting is disabled', async ({
    page,
    isCollab,
    shouldAllowHighlightingWithBrackets,
    legacyEvents,
    tableHorizontalScroll,
    browserName,
    environment,
  }) => {
    await initialize({
      browserName,
      environment,
      isCollab,
      legacyEvents,
      page,
      shouldAllowHighlightingWithBrackets: false,
      tableHorizontalScroll,
    });
    await focusEditor(page, isCollab);
    await page.keyboard.type('[MLH Fellowship]');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">[MLH Fellowship]</span>
        </p>
      `,
    );
  });
});
