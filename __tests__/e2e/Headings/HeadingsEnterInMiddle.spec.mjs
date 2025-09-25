/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveRight,
  moveToEditorBeginning,
  STANDARD_KEYPRESS_DELAY_MS,
} from '../../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  focusEditor,
  html,
  initialize,
  test,
} from '../../utils/index.mjs';

test(`Headings - stays as a heading when you press enter in the middle of a heading`, async ({
  page,
  isCollab,
  isPlainText,
  isRichText,
  legacyEvents,
  tableHorizontalScroll,
  browserName,
  environment,
}) => {
  test.skip(isPlainText);
  await initialize({
    browserName,
    environment,
    isCollab,
    isRichText,
    legacyEvents,
    page,
    tableHorizontalScroll,
  });
  await focusEditor(page, isCollab);

  await click(page, isCollab, '.block-controls');
  await click(page, isCollab, '.dropdown .icon.h1');

  await page.keyboard.type('Welcome to the playground');

  await assertHTML(
    page,
    isCollab,
    browserName,
    html`
      <h1 class="PlaygroundEditorTheme__h1" dir="auto">
        <span data-lexical-text="true">Welcome to the playground</span>
      </h1>
    `,
  );

  await moveToEditorBeginning(page, browserName);

  await moveRight(page, 5, STANDARD_KEYPRESS_DELAY_MS);

  await page.keyboard.press('Enter');

  await assertHTML(
    page,
    isCollab,
    browserName,
    html`
      <h1 class="PlaygroundEditorTheme__h1" dir="auto">
        <span data-lexical-text="true">Welco</span>
      </h1>
      <h1 class="PlaygroundEditorTheme__h1" dir="auto">
        <span data-lexical-text="true">me to the playground</span>
      </h1>
    `,
  );
});
