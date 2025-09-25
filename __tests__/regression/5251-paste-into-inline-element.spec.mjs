/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveToLineBeginning,
  moveToNextWord,
  moveToPrevWord,
  selectCharacters,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  copyToClipboard,
  focusEditor,
  html,
  initialize,
  IS_WINDOWS,
  pasteFromClipboard,
  pressToggleBold,
  test,
  withExclusiveClipboardAccess,
} from '../utils/index.mjs';

test.describe('Regression test #5251', () => {
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
  test('Correctly pastes rich content inside an inline element', async ({
    isPlainText,
    isCollab,
    page,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    // Root
    //   |- Paragraph
    //      |- Text "Hello "
    //      |- Text "bold" { format: bold }
    //      |- Text " "
    //      |- Link
    //         |- Text "World"
    await page.keyboard.type('Hello ');
    await pressToggleBold(page);
    await page.keyboard.type('bold');
    await pressToggleBold(page);
    await page.keyboard.type(' World');
    await moveToPrevWord(page);
    await selectCharacters(page, 'right', 'World'.length);
    await click(page, isCollab, '.link');
    await click(page, isCollab, '.link-confirm');

    // Copy "Hello bold"
    await moveToLineBeginning(page);
    await selectCharacters(page, 'right', 'Hello bold'.length);
    await withExclusiveClipboardAccess(async () => {
      const clipboard = await copyToClipboard(page, isCollab);

      // Drop "bold"
      await page.keyboard.press('ArrowLeft');
      await moveToNextWord(page);
      await selectCharacters(page, 'right', 'bold '.length);
      await page.keyboard.press('Delete');

      // Check our current state
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Hello</span>
            <a
              class="PlaygroundEditorTheme__link"
              href="https://"
              rel="noreferrer">
              <span data-lexical-text="true">World</span>
            </a>
          </p>
        `,
      );

      // Replace "Wor" with the contents of the clipboard
      if (!IS_WINDOWS) {
        await page.keyboard.press('ArrowRight');
      }
      await selectCharacters(page, 'right', 'Wor'.length);
      await pasteFromClipboard(page, isCollab, clipboard);

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Hello Hello</span>
            <strong
              class="PlaygroundEditorTheme__textBold"
              data-lexical-text="true">
              bold
            </strong>
            <a
              class="PlaygroundEditorTheme__link"
              href="https://"
              rel="noreferrer">
              <span data-lexical-text="true">ld</span>
            </a>
          </p>
        `,
      );
    });
  });
});
