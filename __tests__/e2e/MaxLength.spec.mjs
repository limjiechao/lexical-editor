/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  pressBackspace,
  STANDARD_KEYPRESS_DELAY_MS,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  clearEditor,
  focusEditor,
  html,
  initialize,
  pasteFromClipboard,
  test,
} from '../utils/index.mjs';

test.describe('MaxLength', () => {
  test.use({isMaxLength: true});
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isCollab,
      isRichText,
      isMaxLength,
      legacyEvents,
      page,
    }) =>
      initialize({
        browserName,
        environment,
        isCollab,
        isMaxLength,
        isRichText,
        legacyEvents,
        page,
        tableHorizontalScroll,
      }),
  );
  test(`can restrict the text to specified length`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type(
      'lorem ipsum dolor sit amet, consectetuer adipiscing elit',
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 30,
      anchorPath: [0, 0, 0],
      focusOffset: 30,
      focusPath: [0, 0, 0],
    });

    await page.keyboard.press('ArrowRight');
    await page.keyboard.type('Some more text');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, co</span>
        </p>
      `,
    );
  });

  test(`can restrict pasted text to specified length`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await pasteFromClipboard(page, isCollab, {
      'text/plain': 'lorem ipsum dolor sit amet, consectetuer adipiscing elit',
    });
    await page.keyboard.type('Some more text');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, co</span>
        </p>
      `,
    );
  });

  test(`can restrict emojis on boundaries`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await pasteFromClipboard(page, isCollab, {
      'text/plain': 'lorem ipsum dolor sit amet, consectetur adipiscing elit',
    });
    await pressBackspace(page);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, c</span>
        </p>
      `,
    );

    await page.keyboard.type('💏', {delay: STANDARD_KEYPRESS_DELAY_MS});

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, c</span>
        </p>
      `,
    );

    await pressBackspace(page);
    await page.keyboard.type('💏');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, 💏</span>
        </p>
      `,
    );

    await clearEditor(page, isCollab, browserName);
    await page.keyboard.type('👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻👨‍💻</span>
        </p>
      `,
    );
  });

  test(`paste with empty paragraph in between #3773`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await pasteFromClipboard(page, isCollab, {
      'text/plain':
        'lorem ipsum dolor sit amet, consectetuer \n\nadipiscing elit\n\n',
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, co</span>
        </p>
      `,
    );
  });

  test(`paste with empty paragraph at end #3773`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await pasteFromClipboard(page, isCollab, {
      'text/plain':
        'lorem ipsum dolor sit amet, consectetuer adipiscing elit\n\n',
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">lorem ipsum dolor sit amet, co</span>
        </p>
      `,
    );
  });
});
