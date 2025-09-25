/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  assertHTML,
  assertSelection,
  clearEditor,
  focusEditor,
  html,
  initialize,
  pasteFromClipboard,
  selectFromAlignDropdown,
  test,
} from '../../../utils/index.mjs';

test.describe('HTML Lists CopyAndPaste', () => {
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

  test('Copy + paste a list element', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    const clipboard = {'text/html': '<ul><li>Hello</li><li>world!</li></ul>'};

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">world!</span>
          </li>
        </ul>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 6,
      anchorPath: [0, 1, 0, 0],
      focusOffset: 6,
      focusPath: [0, 1, 0, 0],
    });

    await selectFromAlignDropdown(page, isCollab, '.indent');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">world!</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await selectFromAlignDropdown(page, isCollab, '.outdent');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">world!</span>
          </li>
        </ul>
      `,
    );
  });

  test('Copy + paste a Lexical nested list', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html':
        '<ul><li>Hello</li><li><ul><li>awesome</li></ul></li><li>world!</li></ul>',
    };

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">awesome</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">world!</span>
          </li>
        </ul>
      `,
    );
  });

  test('Copy + paste (Nested List - directly nested ul)', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': '<ul><ul><li>Hello</li></ul><li>world!</li></ul>',
    };

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">Hello</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">world!</span>
          </li>
        </ul>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 6,
      anchorPath: [0, 1, 0, 0],
      focusOffset: 6,
      focusPath: [0, 1, 0, 0],
    });

    await selectFromAlignDropdown(page, isCollab, '.indent');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">Hello</span>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">world!</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await page.keyboard.press('ArrowUp');

    await selectFromAlignDropdown(page, isCollab, '.outdent');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">world!</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('Copy + paste (Nested List - li with non-list content plus ul child)', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': '<ul><li>Hello<ul><li>world!</li></ul></li></ul>',
    };

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">world!</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 6,
      anchorPath: [0, 1, 0, 0, 0, 0],
      focusOffset: 6,
      focusPath: [0, 1, 0, 0, 0, 0],
    });

    await selectFromAlignDropdown(page, isCollab, '.outdent');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">world!</span>
          </li>
        </ul>
      `,
    );

    await page.keyboard.press('ArrowUp');

    await selectFromAlignDropdown(page, isCollab, '.indent');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">Hello</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">world!</span>
          </li>
        </ul>
      `,
    );
  });

  test('Copy + paste a checklist', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': `<meta charset='utf-8'><ul __lexicallisttype="check"><li role="checkbox" tabindex="-1" aria-checked="false" value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span>Hello</span></li><li role="checkbox" tabindex="-1" aria-checked="false" value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span>world</span></li></ul>`,
    };

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul
          class="PlaygroundEditorTheme__ul PlaygroundEditorTheme__checklist"
          dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"
            role="checkbox"
            tabindex="-1"
            value="1"
            aria-checked="false">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"
            role="checkbox"
            tabindex="-1"
            value="2"
            aria-checked="false">
            <span data-lexical-text="true">world</span>
          </li>
        </ul>
      `,
    );

    await clearEditor(page, isCollab, browserName);
    await focusEditor(page, isCollab);

    // Ensure we preserve checked status.
    clipboard['text/html'] =
      `<meta charset='utf-8'><ul __lexicallisttype="check"><li role="checkbox" tabindex="-1" aria-checked="true" value="1" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemChecked"><span>Hello</span></li><li role="checkbox" tabindex="-1" aria-checked="false" value="2" class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"><span>world</span></li></ul>`;

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul
          class="PlaygroundEditorTheme__ul PlaygroundEditorTheme__checklist"
          dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemChecked"
            role="checkbox"
            tabindex="-1"
            value="1"
            aria-checked="true">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__listItemUnchecked"
            role="checkbox"
            tabindex="-1"
            value="2"
            aria-checked="false">
            <span data-lexical-text="true">world</span>
          </li>
        </ul>
      `,
    );
  });

  test('Paste top level element in the middle of list', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText || isCollab);
    await focusEditor(page, isCollab);
    // Add three list items
    await page.keyboard.type('- one');
    await page.keyboard.press('Enter');
    await page.keyboard.type('two');
    await page.keyboard.press('Enter');
    await page.keyboard.type('three');
    await page.keyboard.press('Enter');
    await page.keyboard.type('four');

    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await pasteFromClipboard(page, isCollab, {
      'text/html': `<hr />`,
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">one</span>
          </li>
        </ul>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">two</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">three</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">four</span>
          </li>
        </ul>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
  });

  test('Copy + paste a nested divs in a list', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': html`
        <ol>
          <li>
            1
            <div>2</div>
            3
          </li>
          <li>
            A
            <div>B</div>
            C
          </li>
        </ol>
      `,
    };

    await pasteFromClipboard(page, isCollab, clipboard);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">1</span>
            <br />
            <span data-lexical-text="true">2</span>
            <br />
            <span data-lexical-text="true">3</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">A</span>
            <br />
            <span data-lexical-text="true">B</span>
            <br />
            <span data-lexical-text="true">C</span>
          </li>
        </ol>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [0, 1, 4, 0],
      focusOffset: 1,
      focusPath: [0, 1, 4, 0],
    });
  });
});
