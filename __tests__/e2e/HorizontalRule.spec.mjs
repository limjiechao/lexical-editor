/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveLeft,
  moveToLineBeginning,
  pressBackspace,
  selectAll,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  click,
  copyToClipboard,
  focusEditor,
  html,
  initialize,
  pasteFromClipboard,
  selectFromInsertDropdown,
  test,
  waitForSelector,
  withExclusiveClipboardAccess,
} from '../utils/index.mjs';

async function toggleBulletList(page, isCollab) {
  await click(page, isCollab, '.block-controls');
  await click(page, isCollab, '.dropdown .icon.bullet-list');
}

test.describe('HorizontalRule', () => {
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
  test(
    'Can create a horizontal rule and move selection around it',
    {tag: '@flaky'},
    async ({page, isCollab, isPlainText, browserName}) => {
      test.skip(isPlainText);
      await focusEditor(page, isCollab);

      await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

      await waitForSelector(page, isCollab, 'hr');

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
          <hr
            class="PlaygroundEditorTheme__hr"
            contenteditable="false"
            data-lexical-decorator="true" />
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        `,
      );

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [2],
        focusOffset: 0,
        focusPath: [2],
      });

      await page.keyboard.press('ArrowUp');

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [0],
        focusOffset: 0,
        focusPath: [0],
      });

      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [2],
        focusOffset: 0,
        focusPath: [2],
      });

      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [0],
        focusOffset: 0,
        focusPath: [0],
      });

      await page.keyboard.type('Some text');

      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [2],
        focusOffset: 0,
        focusPath: [2],
      });

      await page.keyboard.type('Some more text');

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Some text</span>
          </p>
          <hr
            class="PlaygroundEditorTheme__hr"
            contenteditable="false"
            data-lexical-decorator="true" />
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Some more text</span>
          </p>
        `,
      );

      await moveToLineBeginning(page);

      await page.keyboard.press('ArrowLeft');

      await page.keyboard.press('ArrowLeft');

      await assertSelection(page, isCollab, {
        anchorOffset: 1,
        anchorPath: [0],
        focusOffset: 1,
        focusPath: [0],
      });

      await pressBackspace(page, 10);

      // Collab doesn't process the cursor correctly
      if (!isCollab) {
        await assertHTML(
          page,
          isCollab,
          browserName,
          '<div class="PlaygroundEditorTheme__blockCursor" contenteditable="false" data-lexical-cursor="true"></div><hr class="PlaygroundEditorTheme__hr" data-lexical-decorator="true" contenteditable="false"><p class="PlaygroundEditorTheme__paragraph" dir="auto"><span data-lexical-text="true">Some more text</span></p>',
        );
      }

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [],
        focusOffset: 0,
        focusPath: [],
      });
    },
  );

  test('Will add a horizontal rule at the end of a current TextNode and move selection to the new ParagraphNode.', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    await page.keyboard.type('Test');

    await assertSelection(page, isCollab, {
      anchorOffset: 4,
      anchorPath: [0, 0, 0],
      focusOffset: 4,
      focusPath: [0, 0, 0],
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Test</span>
        </p>
      `,
    );

    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

    await waitForSelector(page, isCollab, 'hr');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Test</span>
        </p>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2],
      focusOffset: 0,
      focusPath: [2],
    });
  });

  test('Will add a horizontal rule and split a TextNode across 2 paragraphs if the caret is in the middle of the TextNode, moving selection to the start of the new ParagraphNode.', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    await page.keyboard.type('Test');

    await assertSelection(page, isCollab, {
      anchorOffset: 4,
      anchorPath: [0, 0, 0],
      focusOffset: 4,
      focusPath: [0, 0, 0],
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Test</span>
        </p>
      `,
    );

    await moveLeft(page, 2);

    await assertSelection(page, isCollab, {
      anchorOffset: 2,
      anchorPath: [0, 0, 0],
      focusOffset: 2,
      focusPath: [0, 0, 0],
    });

    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

    await waitForSelector(page, isCollab, 'hr');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Te</span>
        </p>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">st</span>
        </p>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2, 0, 0],
      focusOffset: 0,
      focusPath: [2, 0, 0],
    });
  });

  test('Will add a horizontal rule and split a TextNode across 2 ListItemNode if the caret is in the middle of the TextNode, moving selection to the start of the new ParagraphNode', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Test');

    await assertSelection(page, isCollab, {
      anchorOffset: 4,
      anchorPath: [0, 0, 0, 0],
      focusOffset: 4,
      focusPath: [0, 0, 0, 0],
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Test</span>
          </li>
        </ul>
      `,
    );

    await moveLeft(page, 2);

    await assertSelection(page, isCollab, {
      anchorOffset: 2,
      anchorPath: [0, 0, 0, 0],
      focusOffset: 2,
      focusPath: [0, 0, 0, 0],
    });

    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

    await waitForSelector(page, isCollab, 'hr');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Te</span>
          </li>
        </ul>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">st</span>
          </li>
        </ul>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2, 0, 0, 0],
      focusOffset: 0,
      focusPath: [2, 0, 0, 0],
    });
  });

  test('Will add a horizontal rule and split a TextNode across 2 ListItemNode if the caret is in an empty ListItemNode, moving selection to the start of the new ListItemNode (#6849)', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [0, 0],
      focusOffset: 0,
      focusPath: [0, 0],
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <br />
          </li>
        </ul>
      `,
    );

    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

    await waitForSelector(page, isCollab, 'hr');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <br />
          </li>
        </ul>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <br />
          </li>
        </ul>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2, 0],
      focusOffset: 0,
      focusPath: [2, 0],
    });
  });

  test('Can copy and paste a horizontal rule', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

    await waitForSelector(page, isCollab, 'hr');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2],
      focusOffset: 0,
      focusPath: [2],
    });

    // Select all the text
    await selectAll(page, isCollab, browserName);

    await withExclusiveClipboardAccess(async () => {
      // Copy all the text
      const clipboard = await copyToClipboard(page, isCollab);

      // Delete content
      await page.keyboard.press('Backspace');

      await pasteFromClipboard(page, isCollab, clipboard);

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
          <hr
            class="PlaygroundEditorTheme__hr"
            contenteditable="false"
            data-lexical-decorator="true" />
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        `,
      );

      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [2],
        focusOffset: 0,
        focusPath: [2],
      });

      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Backspace');

      await pasteFromClipboard(page, isCollab, clipboard);
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2],
      focusOffset: 0,
      focusPath: [2],
    });
  });

  test('Can delete empty paragraph after a horizontal rule without deleting the horizontal rule', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText || isCollab);

    await focusEditor(page, isCollab);

    await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');

    await waitForSelector(page, isCollab, 'hr');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <hr
          class="PlaygroundEditorTheme__hr"
          contenteditable="false"
          data-lexical-decorator="true" />
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2],
      focusOffset: 0,
      focusPath: [2],
    });

    // Delete content
    await page.keyboard.press('Backspace');

    await focusEditor(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <hr
          class="PlaygroundEditorTheme__hr PlaygroundEditorTheme__hrSelected"
          contenteditable="false"
          data-lexical-decorator="true" />
      `,
    );

    if (browserName === 'webkit' || browserName === 'firefox') {
      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [],
        focusOffset: 0,
        focusPath: [],
      });
    } else {
      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [0],
        focusOffset: 0,
        focusPath: [0],
      });
    }

    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Delete');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <hr
          class="PlaygroundEditorTheme__hr PlaygroundEditorTheme__hrSelected"
          contenteditable="false"
          data-lexical-decorator="true" />
      `,
    );

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [],
      focusOffset: 0,
      focusPath: [],
    });
  });
});
