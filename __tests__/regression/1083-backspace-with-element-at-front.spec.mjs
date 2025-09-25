/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveToLineEnd,
  selectAll,
  selectCharacters,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  focusEditor,
  html,
  initialize,
  test,
} from '../utils/index.mjs';

test.describe('Regression test #1083', () => {
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
  test(`Backspace with ElementNode at the front of the paragraph`, async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello');
    await selectAll(page, isCollab, browserName);
    await click(page, isCollab, '.link');
    await click(page, isCollab, '.link-confirm');

    await moveToLineEnd(page);
    await page.keyboard.type('World');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <a
            class="PlaygroundEditorTheme__link"
            href="https://"
            rel="noreferrer">
            <span data-lexical-text="true">Hello</span>
          </a>
          <span data-lexical-text="true">World</span>
        </p>
      `,
    );

    await selectAll(page, isCollab, browserName);
    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
  });

  test(`Backspace with ElementNode at the front of the selection`, async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    await page.keyboard.type('Say');

    await page.keyboard.type('Hello');
    await selectCharacters(page, 'left', 'Hello'.length);
    await click(page, isCollab, '.link');
    await click(page, isCollab, '.link-confirm');

    await moveToLineEnd(page);
    await page.keyboard.type('World');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Say</span>
          <a
            class="PlaygroundEditorTheme__link"
            href="https://"
            rel="noreferrer">
            <span data-lexical-text="true">Hello</span>
          </a>
          <span data-lexical-text="true">World</span>
        </p>
      `,
    );

    await selectCharacters(page, 'left', 'HelloWorld'.length);
    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Say</span>
        </p>
      `,
    );
  });
});
