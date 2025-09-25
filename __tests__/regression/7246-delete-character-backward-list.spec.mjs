/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  deleteBackward,
  moveToLineBeginning,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  focusEditor,
  html,
  initialize,
  test,
} from '../utils/index.mjs';

test.describe('Regression tests for #7246', () => {
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isPlainText,
      isRichText,
      isCollab,
      legacyEvents,
      page,
    }) =>
      initialize({
        browserName,
        environment,
        isCollab,
        isPlainText,
        isRichText,
        legacyEvents,
        page,
        tableHorizontalScroll,
      }),
  );

  test(`deleteCharacter merges children from block adjacent to ListNode`, async ({
    page,
    isCollab,
    isPlainText,
    browserName,
  }) => {
    test.skip(isCollab || isPlainText);
    await focusEditor(page, isCollab);
    await page.keyboard.type('* list');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('paragraph');
    const beforeHtml = html`
      <ul dir="auto">
        <li value="1"><span data-lexical-text="true">list</span></li>
      </ul>
      <p dir="auto"><span data-lexical-text="true">paragraph</span></p>
    `;
    await assertHTML(page, isCollab, browserName, beforeHtml, beforeHtml, {
      ignoreClasses: true,
      ignoreInlineStyles: true,
    });
    await moveToLineBeginning(page);
    await deleteBackward(page);
    const afterHtml = html`
      <ul dir="auto">
        <li value="1">
          <span data-lexical-text="true">listparagraph</span>
        </li>
      </ul>
    `;
    await assertHTML(page, isCollab, browserName, afterHtml, afterHtml, {
      ignoreClasses: true,
      ignoreInlineStyles: true,
    });
  });
});
