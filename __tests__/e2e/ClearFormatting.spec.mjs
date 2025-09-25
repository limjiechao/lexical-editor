/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  centerAlign,
  indent,
  outdent,
  rightAlign,
  selectAll,
  toggleBold,
  toggleItalic,
  toggleUnderline,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  clearEditor,
  focusEditor,
  html,
  initialize,
  pasteFromClipboard,
  selectFromAdditionalStylesDropdown,
  selectFromBackgroundColorPicker,
  selectFromColorPicker,
  test,
} from '../utils/index.mjs';

test.describe('Clear All Formatting', () => {
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
  test(`Can clear BIU formatting`, async ({page, isCollab, browserName}) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello');
    await toggleBold(page);
    await page.keyboard.type(' World');
    await toggleItalic(page);
    await toggleUnderline(page);
    await page.keyboard.type(' Test');
    await selectAll(page, isCollab, browserName);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello World Test</span>
        </p>
      `,
    );
  });

  test(`Should preserve the default styling of links and quoted text`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': '<a href="https://facebook.com">Facebook!</a>',
    };

    await pasteFromClipboard(page, isCollab, clipboard);
    await selectAll(page, isCollab, browserName);
    await toggleBold(page);
    await toggleItalic(page);
    await toggleUnderline(page);
    await selectFromColorPicker(page, isCollab);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <a class="PlaygroundEditorTheme__link" href="https://facebook.com">
            <span data-lexical-text="true">Facebook!</span>
          </a>
        </p>
      `,
    );

    await clearEditor(page, isCollab, browserName);

    await page.keyboard.type('> Testing for quote node');
    await selectAll(page, isCollab, browserName);
    await toggleBold(page);
    await toggleItalic(page);
    await toggleUnderline(page);
    await selectFromBackgroundColorPicker(page, isCollab);
    await selectFromColorPicker(page, isCollab);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <blockquote class="PlaygroundEditorTheme__quote" dir="auto">
          <span data-lexical-text="true">Testing for quote node</span>
        </blockquote>
      `,
    );
  });

  test(`Can clear left/center/right alignment when BIU formatting already applied`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello');
    await toggleBold(page);
    await page.keyboard.type(' World');
    await rightAlign(page);
    await page.keyboard.type(' Test');
    await selectAll(page, isCollab, browserName);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto" style="">
          <span data-lexical-text="true">Hello World Test</span>
        </p>
      `,
    );
  });

  test(`Can clear left/center/right alignment when BIU formatting not applied`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello World');
    await rightAlign(page);
    await page.keyboard.type(' Test');
    await centerAlign(page);
    await selectAll(page, isCollab, browserName);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto" style="">
          <span data-lexical-text="true">Hello World Test</span>
        </p>
      `,
    );
  });

  test(`Can clear when only indent/outdent alignment is applied`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello World');
    await indent(page);
    await page.keyboard.type(' Test');
    await indent(page);
    await selectAll(page, isCollab, browserName);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto" style="">
          <span data-lexical-text="true">Hello World Test</span>
        </p>
      `,
    );
  });

  test(`Can clear indent/outdent alignment when other formatting options like BIU or left/right/center align are also applied`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello');
    await toggleBold(page);
    await toggleItalic(page);
    await page.keyboard.type(' World');
    await indent(page);
    await indent(page);
    await indent(page);
    await rightAlign(page);
    await page.keyboard.type(' Test');
    await outdent(page);
    await selectAll(page, isCollab, browserName);
    await selectFromAdditionalStylesDropdown(page, isCollab, '.clear');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto" style="">
          <span data-lexical-text="true">Hello World Test</span>
        </p>
      `,
    );
  });
});
