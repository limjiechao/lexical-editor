/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveLeft,
  moveRight,
  selectCharacters,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  focusEditor,
  html,
  initialize,
  pasteFromClipboard,
  test,
} from '../utils/index.mjs';

test.describe('Regression test #3136', () => {
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
  test('Correctly pastes rich content when the selection is followed by an inline element', async ({
    isPlainText,
    isCollab,
    page,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    // Non-link text
    await page.keyboard.type('text');

    // Link
    await page.keyboard.type('link');
    await selectCharacters(page, 'left', 'link'.length);
    await click(page, isCollab, '.link');
    await click(page, isCollab, '.link-confirm');

    // Select non-link text so that selection ends just before the link
    await moveLeft(page, 5);
    await selectCharacters(page, 'right', 'text'.length);

    // Paste to replace it (needs to be rich text in order to exercise
    // insertNodes)
    await pasteFromClipboard(page, isCollab, {'text/html': 'replaced'});

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">replaced</span>
          <a
            class="PlaygroundEditorTheme__link"
            href="https://"
            rel="noreferrer">
            <span data-lexical-text="true">link</span>
          </a>
        </p>
      `,
    );
  });

  test('Correctly pastes rich content when the selection is preceded by an inline element', async ({
    isPlainText,
    isCollab,
    page,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    // Link
    await page.keyboard.type('link');
    await selectCharacters(page, 'left', 'link'.length);
    await click(page, isCollab, '.link');
    await click(page, isCollab, '.link-confirm');

    // Non-link text
    await moveRight(page, 1);
    await page.keyboard.type('text');

    // Select non-link text so that selection ends just before the link
    await moveLeft(page, 4);
    await selectCharacters(page, 'right', 'text'.length);

    // Paste to replace it (needs to be rich text in order to exercise
    // insertNodes)
    await pasteFromClipboard(page, isCollab, {'text/html': 'replaced'});

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
            <span data-lexical-text="true">link</span>
          </a>
          <span data-lexical-text="true">replaced</span>
        </p>
      `,
    );
  });
});
