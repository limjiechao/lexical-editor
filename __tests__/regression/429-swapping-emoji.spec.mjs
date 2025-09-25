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
  assertSelection,
  focusEditor,
  html,
  initialize,
  test,
} from '../utils/index.mjs';

test.describe('Regression test #429', () => {
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
  test(
    `Can add new lines before the line with emoji`,
    {tag: '@flaky'},
    async ({isRichText, isCollab, page, browserName}) => {
      await focusEditor(page, isCollab);
      await page.keyboard.type('🙂 or 🙁');
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">🙂 or 🙁</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 8,
        anchorPath: [0, 0, 0],
        focusOffset: 8,
        focusPath: [0, 0, 0],
      });

      await moveLeft(page, 6);
      await page.keyboard.press('Enter');
      if (isRichText) {
        await assertHTML(
          page,
          isCollab,
          browserName,
          html`
            <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">🙂 or 🙁</span>
            </p>
          `,
        );
        await assertSelection(page, isCollab, {
          anchorOffset: 0,
          anchorPath: [1, 0, 0],
          focusOffset: 0,
          focusPath: [1, 0, 0],
        });
      } else {
        await assertHTML(
          page,
          isCollab,
          browserName,
          html`
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <br />
              <span data-lexical-text="true">🙂 or 🙁</span>
            </p>
          `,
        );
        await assertSelection(page, isCollab, {
          anchorOffset: 0,
          anchorPath: [0, 1, 0],
          focusOffset: 0,
          focusPath: [0, 1, 0],
        });
      }

      await page.keyboard.press('Backspace');
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">🙂 or 🙁</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [0, 0, 0],
        focusOffset: 0,
        focusPath: [0, 0, 0],
      });
    },
  );
});
