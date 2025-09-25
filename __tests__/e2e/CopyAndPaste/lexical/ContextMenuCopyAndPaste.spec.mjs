/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {moveToLineEnd} from '../../../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  doubleClick,
  focusEditor,
  getPageOrFrame,
  html,
  initialize,
  pasteFromClipboard,
  test,
  withExclusiveClipboardAccess,
} from '../../../utils/index.mjs';

test.describe('ContextMenuCopyAndPaste', () => {
  test.use({shouldUseLexicalContextMenu: true});
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isCollab,
      isRichText,
      legacyEvents,
      page,
      shouldUseLexicalContextMenu,
    }) =>
      initialize({
        browserName,
        environment,
        isCollab,
        isRichText,
        legacyEvents,
        page,
        shouldUseLexicalContextMenu,
        tableHorizontalScroll,
      }),
  );

  test('Basic copy-paste #6231', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    await page.keyboard.type('hello');
    await click(page, isCollab, '.lock');

    await doubleClick(page, isCollab, 'div[contenteditable="false"] span');
    await withExclusiveClipboardAccess(async () => {
      await click(page, isCollab, 'div[contenteditable="false"] span', {
        button: 'right',
      });
      await getPageOrFrame(page, isCollab)
        .getByRole('menuitem', {name: 'Copy'})
        .click();
      await click(page, isCollab, '.unlock');
      await focusEditor(page, isCollab);

      await pasteFromClipboard(page);
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">hellohello</span>
        </p>
      `,
    );
  });

  test('Rich text Copy and Paste with  different Font Size', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isCollab || isPlainText || browserName !== 'chromium');

    await withExclusiveClipboardAccess(async () => {
      await page
        .context()
        .grantPermissions(['clipboard-read', 'clipboard-write']);

      await click(page, isCollab, '.font-increment');
      await focusEditor(page, isCollab);
      await page.keyboard.type('MLH Fellowship');
      await moveToLineEnd(page);
      await page.keyboard.press('Enter');
      await page.keyboard.type('Fall 2024');

      await click(page, isCollab, '.lock');

      await doubleClick(page, isCollab, 'div[contenteditable="false"] span');
      await click(page, isCollab, 'div[contenteditable="false"] span', {
        button: 'right',
      });
      await getPageOrFrame(page, isCollab)
        .getByRole('menuitem', {name: 'Copy'})
        .click();

      await click(page, isCollab, '.unlock');
      await focusEditor(page, isCollab);
      await pasteFromClipboard(page);
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span style="font-size: 17px;" data-lexical-text="true">
            MLH Fellowship
          </span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span style="font-size: 17px;" data-lexical-text="true">
            Fall 2024Fellowship
          </span>
        </p>
      `,
    );
  });
});
