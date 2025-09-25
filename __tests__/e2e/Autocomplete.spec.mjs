/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  decreaseFontSize,
  increaseFontSize,
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  toggleUnderline,
  undo,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  focusEditor,
  html,
  initialize,
  sleep,
  test,
} from '../utils/index.mjs';

test.describe('Autocomplete', () => {
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
        isAutocomplete: true,
        isCollab,
        isRichText,
        legacyEvents,
        page,
        tableHorizontalScroll,
      }),
  );
  test('Can autocomplete a word', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await page.keyboard.type('Sort by occupa');
    await sleep(500);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Sort by occupa</span>
          <span
            class="PlaygroundEditorTheme__autocomplete"
            style="font-size: 15px"
            data-lexical-text="true">
            tion (TAB)
          </span>
        </p>
      `,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Sort by occupa</span>
          <span
            class="PlaygroundEditorTheme__autocomplete"
            style="font-size: 15px; display: none"
            data-lexical-text="true">
            tion (TAB)
          </span>
        </p>
      `,
    );
    await page.keyboard.press('Tab');
    await page.keyboard.type(' hazards:');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Sort by occupa</span>
          <span style="font-size: 15px" data-lexical-text="true">
            tion hazards:
          </span>
        </p>
      `,
    );
  });

  test('Can autocomplete in the same format as the original text', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await toggleBold(page);
    await toggleItalic(page);
    await toggleUnderline(page);
    await toggleStrikethrough(page);
    await increaseFontSize(page);

    await page.keyboard.type('Test');
    await sleep(500);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__autocomplete"
            style="font-size: 17px;"
            data-lexical-text="true">
            ing (TAB)
          </strong>
        </p>
      `,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__autocomplete"
            style="font-size: 17px; display: none"
            data-lexical-text="true">
            ing (TAB)
          </strong>
        </p>
      `,
    );

    await page.keyboard.press('Tab');

    await toggleBold(page);
    await toggleItalic(page);
    await toggleUnderline(page);
    await toggleStrikethrough(page);
    await decreaseFontSize(page);

    await page.keyboard.type(' 123');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            ing
          </strong>
          <span style="font-size: 15px;" data-lexical-text="true">123</span>
        </p>
      `,
    );
  });
  test('Undo does not cause an exception', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    // Autocomplete has known issues in collab https://github.com/facebook/lexical/issues/6844
    test.skip(isCollab);
    await focusEditor(page, isCollab);
    await toggleBold(page);
    await toggleItalic(page);
    await toggleUnderline(page);
    await toggleStrikethrough(page);
    await increaseFontSize(page);

    await page.keyboard.type('Test');
    await sleep(500);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__autocomplete"
            style="font-size: 17px;"
            data-lexical-text="true">
            ing (TAB)
          </strong>
        </p>
      `,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__autocomplete"
            style="font-size: 17px; display: none"
            data-lexical-text="true">
            ing (TAB)
          </strong>
        </p>
      `,
    );

    await page.keyboard.press('Tab');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            ing
          </strong>
        </p>
      `,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px; display: none"
            data-lexical-text="true">
            ing
          </strong>
        </p>
      `,
    );

    await undo(page);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__autocomplete"
            style="font-size: 17px;"
            data-lexical-text="true">
            ing (TAB)
          </strong>
        </p>
      `,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            style="font-size: 17px;"
            data-lexical-text="true">
            Test
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__autocomplete"
            style="font-size: 17px; display: none"
            data-lexical-text="true">
            ing (TAB)
          </strong>
        </p>
      `,
    );
  });
});
