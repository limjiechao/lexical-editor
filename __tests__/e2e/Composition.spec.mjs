/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {pressBackspace, selectCharacters} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  enableCompositionKeyEvents,
  evaluate,
  expect,
  focusEditor,
  html,
  initialize,
  keyDownCtrlOrMeta,
  keyUpCtrlOrMeta,
  test,
} from '../utils/index.mjs';

test.use({launchOptions: {slowMo: 50}});
test.describe('Composition', () => {
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
  test('Handles Hiragana characters', async ({page, isCollab, browserName}) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('も');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">も</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [0, 0, 0],
      focusOffset: 1,
      focusPath: [0, 0, 0],
    });

    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [0],
      focusOffset: 0,
      focusPath: [0],
    });

    await page.keyboard.type('もじ');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">もじ</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 2,
      anchorPath: [0, 0, 0],
      focusOffset: 2,
      focusPath: [0, 0, 0],
    });
  });

  test('Handles Arabic characters with diacritics', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('هَ');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">هَ</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 2,
      anchorPath: [0, 0, 0],
      focusOffset: 2,
      focusPath: [0, 0, 0],
    });

    await page.keyboard.press('Backspace');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">ه</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [0, 0, 0],
      focusOffset: 1,
      focusPath: [0, 0, 0],
    });

    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await page.keyboard.type('هَ');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">هَ</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 2,
      anchorPath: [0, 0, 0],
      focusOffset: 2,
      focusPath: [0, 0, 0],
    });

    await page.keyboard.press('ArrowRight');
    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [0, 0, 0],
      focusOffset: 0,
      focusPath: [0, 0, 0],
    });

    await page.keyboard.press('Delete');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">ه</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [0, 0, 0],
      focusOffset: 1,
      focusPath: [0, 0, 0],
    });
  });
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  test.describe('IME', () => {
    test('Can type Hiragana via IME', async ({page, browserName, isCollab}) => {
      // We don't yet support FF.
      test.skip(browserName !== 'chromium');
      await focusEditor(page, isCollab);
      await enableCompositionKeyEvents(page, isCollab);

      const client = await page.context().newCDPSession(page);

      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      await client.send('Input.insertText', {
        text: 'すし',
      });
      await client.send('Input.insertText', {
        text: ' ',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'm',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'も',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'もj',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'もじ',
      });
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'もじあ',
      });
      await client.send('Input.insertText', {
        text: 'もじあ',
      });

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">すし もじあ</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 6,
        anchorPath: [0, 0, 0],
        focusOffset: 6,
        focusPath: [0, 0, 0],
      });
    });

    test('Can type Hiragana via IME between line breaks', async ({
      page,
      browserName,
      isCollab,
    }) => {
      // We don't yet support FF.
      test.skip(browserName !== 'chromium');

      await focusEditor(page, isCollab);
      await enableCompositionKeyEvents(page, isCollab);

      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');

      await page.keyboard.down('Shift');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Shift');

      await page.keyboard.press('ArrowLeft');

      const client = await page.context().newCDPSession(page);
      // await page.keyboard.imeSetComposition('ｓ', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すし', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      // await page.keyboard.insertText('すし');
      await client.send('Input.insertText', {
        text: 'すし',
      });
      // await page.keyboard.type(' ');
      await client.send('Input.insertText', {
        text: ' ',
      });
      // await page.keyboard.imeSetComposition('m', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'm',
      });
      // await page.keyboard.imeSetComposition('も', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'も',
      });
      // await page.keyboard.imeSetComposition('もj', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'もj',
      });
      // await page.keyboard.imeSetComposition('もじ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'もじ',
      });
      // await page.keyboard.imeSetComposition('もじあ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'もじあ',
      });
      // await page.keyboard.insertText('もじあ');
      await client.send('Input.insertText', {
        text: 'もじあ',
      });

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <br />
            <span data-lexical-text="true">すし もじあ</span>
            <br />
            <br />
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 6,
        anchorPath: [0, 1, 0],
        focusOffset: 6,
        focusPath: [0, 1, 0],
      });
    });

    test('Can type Hiragana via IME into a new bold format', async ({
      page,
      browserName,
      isPlainText,
      isCollab,
    }) => {
      // We don't yet support FF.
      test.skip(browserName !== 'chromium' || isPlainText);

      await focusEditor(page, isCollab);
      await enableCompositionKeyEvents(page, isCollab);

      await page.keyboard.type('Hello');

      await keyDownCtrlOrMeta(page);
      await page.keyboard.press('b');
      await keyUpCtrlOrMeta(page);

      const client = await page.context().newCDPSession(page);
      // await page.keyboard.imeSetComposition('ｓ', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すし', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      // await page.keyboard.insertText('すし');
      await client.send('Input.insertText', {
        text: 'すし',
      });

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Hello</span>
            <strong
              class="PlaygroundEditorTheme__textBold"
              data-lexical-text="true">
              すし
            </strong>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 2,
        anchorPath: [0, 1, 0],
        focusOffset: 2,
        focusPath: [0, 1, 0],
      });
    });

    test('Can type Hiragana via IME between emojis', async ({
      page,
      browserName,
      isCollab,
    }) => {
      test.skip(browserName !== 'chromium');
      await focusEditor(page, isCollab);
      await enableCompositionKeyEvents(page, isCollab);

      await page.keyboard.type('🙂🙂');

      await page.keyboard.press('ArrowLeft');

      const client = await page.context().newCDPSession(page);
      // await page.keyboard.imeSetComposition('ｓ', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すし', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      // await page.keyboard.insertText('すし');
      await client.send('Input.insertText', {
        text: 'すし',
      });
      await page.keyboard.type(' ');
      // await page.keyboard.imeSetComposition('m', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'm',
      });
      // await page.keyboard.imeSetComposition('も', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'も',
      });
      // await page.keyboard.imeSetComposition('もj', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'もj',
      });
      // await page.keyboard.imeSetComposition('もじ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'もじ',
      });
      // await page.keyboard.imeSetComposition('もじあ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'もじあ',
      });
      // await page.keyboard.insertText('もじあ');
      await client.send('Input.insertText', {
        text: 'もじあ',
      });

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">🙂すし もじあ🙂</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 8,
        anchorPath: [0, 0, 0],
        focusOffset: 8,
        focusPath: [0, 0, 0],
      });

      await pressBackspace(page, 6);
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">🙂🙂</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 2,
        anchorPath: [0, 0, 0],
        focusOffset: 2,
        focusPath: [0, 0, 0],
      });

      // await page.keyboard.imeSetComposition('ｓ', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すし', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('', 0, 0);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 0,
        text: '',
      });
      // Escape would fire here
      await page.keyboard.insertText('');

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">🙂🙂</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 2,
        anchorPath: [0, 0, 0],
        focusOffset: 2,
        focusPath: [0, 0, 0],
      });
    });

    test('Can type, delete and cancel Hiragana via IME', async ({
      page,
      browserName,
      isCollab,
    }) => {
      // We don't yet support FF.
      test.skip(browserName !== 'chromium');

      await focusEditor(page, isCollab);
      await enableCompositionKeyEvents(page, isCollab);

      const client = await page.context().newCDPSession(page);
      // await page.keyboard.imeSetComposition('ｓ', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すし', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('', 0, 0);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 0,
        text: '',
      });
      // Escape would fire here
      await page.keyboard.insertText('');

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [0],
        focusOffset: 0,
        focusPath: [0],
      });

      await page.keyboard.type(' ');
      await page.keyboard.press('ArrowLeft');

      // await page.keyboard.imeSetComposition('ｓ', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 3, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 3,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すし', 2, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 2,
        selectionEnd: 2,
        text: 'すし',
      });
      // await page.keyboard.imeSetComposition('す', 1, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 1,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('', 0, 0);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 0,
        text: '',
      });
      // Escape would fire here
      await page.keyboard.insertText('');

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true"></span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [0, 0, 0],
        focusOffset: 0,
        focusPath: [0, 0, 0],
      });
    });

    test('Floating toolbar should not be displayed when using IME', async ({
      page,
      browserName,
      isCollab,
      isPlainText,
    }) => {
      // We don't yet support FF.
      test.skip(browserName !== 'chromium' || isPlainText);

      await focusEditor(page, isCollab);
      await enableCompositionKeyEvents(page, isCollab);

      const client = await page.context().newCDPSession(page);

      // await page.keyboard.imeSetComposition('ｓ', 0, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 1,
        text: 'ｓ',
      });
      // await page.keyboard.imeSetComposition('す', 0, 1);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 1,
        text: 'す',
      });
      // await page.keyboard.imeSetComposition('すｓ', 0, 2);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 2,
        text: 'すｓ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 0, 3);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        selectionEnd: 3,
        text: 'すｓｈ',
      });
      // await page.keyboard.imeSetComposition('すｓｈ', 0, 4);
      await client.send('Input.imeSetComposition', {
        selectionStart: 0,
        // The fourth character in the DOM is a zero-width space
        // which is not represented in the lexical document (or this string)
        selectionEnd: 4,
        text: 'すｓｈ',
      });

      const isFloatingToolbarDisplayedWhenUseIME = await evaluate(
        page,
        isCollab,
        () => {
          return !!document.querySelector('.floating-text-format-popup');
        },
      );

      expect(isFloatingToolbarDisplayedWhenUseIME).toEqual(false);

      // await page.keyboard.insertText('すｓｈ');
      await client.send('Input.insertText', {
        text: 'すｓｈ',
      });
      await selectCharacters(page, 'left', 3);

      const isFloatingToolbarDisplayed = await evaluate(page, isCollab, () => {
        return !!document.querySelector('.floating-text-format-popup');
      });

      expect(isFloatingToolbarDisplayed).toEqual(true);
    });
  });
  /* eslint-enable sort-keys-fix/sort-keys-fix */
});
