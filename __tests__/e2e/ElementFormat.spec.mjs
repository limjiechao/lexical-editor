/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {moveLeft} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  focusEditor,
  html,
  initialize,
  selectFromAlignDropdown,
  test,
} from '../utils/index.mjs';

test.describe('Element format', () => {
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isCollab,
      isRichText,
      isPlainText,
      legacyEvents,
      page,
    }) => {
      test.skip(isPlainText);
      return initialize({
        browserName,
        environment,
        isCollab,
        isRichText,
        legacyEvents,
        page,
        tableHorizontalScroll,
      });
    },
  );

  test('Can indent/align paragraph when caret is within link', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await page.keyboard.type('Hello https://lexical.io world');
    await moveLeft(page, 10);
    await selectFromAlignDropdown(page, isCollab, '.indent');
    await selectFromAlignDropdown(page, isCollab, '.indent');
    await selectFromAlignDropdown(page, isCollab, '.center-align');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(80px); text-align: center;">
          <span data-lexical-text="true">Hello</span>
          <a class="PlaygroundEditorTheme__link" href="https://lexical.io">
            <span data-lexical-text="true">https://lexical.io</span>
          </a>
          <span data-lexical-text="true">world</span>
        </p>
      `,
      undefined,
      {
        ignoreClasses: false,
        ignoreInlineStyles: false,
      },
    );
  });

  test('Can center align an empty paragraph', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await click(page, isCollab, '.alignment');
    await click(page, isCollab, '.center-align');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph"
          dir="auto"
          style="text-align: center">
          <br />
        </p>
      `,
    );
  });
});
