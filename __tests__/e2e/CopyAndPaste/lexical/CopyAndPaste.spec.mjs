/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  moveToEditorBeginning,
  moveToEditorEnd,
  moveToLineEnd,
  selectAll,
} from '../../../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  click,
  copyToClipboard,
  focusEditor,
  html,
  initialize,
  IS_LINUX,
  pasteFromClipboard,
  test,
  withExclusiveClipboardAccess,
} from '../../../utils/index.mjs';

test.describe('CopyAndPaste', () => {
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
  test('Basic copy + paste', async ({
    isRichText,
    page,
    browserName,
    isCollab,
  }) => {
    await focusEditor(page, isCollab);

    // Add paragraph
    await page.keyboard.type('Copy + pasting?');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Sounds good!');
    if (isRichText) {
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Copy + pasting?</span>
          </p>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Sounds good!</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 12,
        anchorPath: [2, 0, 0],
        focusOffset: 12,
        focusPath: [2, 0, 0],
      });
    } else {
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Copy + pasting?</span>
            <br />
            <br />
            <span data-lexical-text="true">Sounds good!</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 12,
        anchorPath: [0, 3, 0],
        focusOffset: 12,
        focusPath: [0, 3, 0],
      });
    }

    // Select all the text
    await selectAll(page, isCollab, browserName);
    if (isRichText) {
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Copy + pasting?</span>
          </p>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Sounds good!</span>
          </p>
        `,
      );
      if (browserName === 'firefox' && IS_LINUX) {
        await assertSelection(page, isCollab, {
          anchorOffset: 0,
          anchorPath: [],
          focusOffset: 3,
          focusPath: [],
        });
      } else {
        await assertSelection(page, isCollab, {
          anchorOffset: 0,
          anchorPath: [0, 0, 0],
          focusOffset: 12,
          focusPath: [2, 0, 0],
        });
      }
    } else {
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Copy + pasting?</span>
            <br />
            <br />
            <span data-lexical-text="true">Sounds good!</span>
          </p>
        `,
      );
      if (browserName === 'firefox' && IS_LINUX) {
        await assertSelection(page, isCollab, {
          anchorOffset: 0,
          anchorPath: [],
          focusOffset: 1,
          focusPath: [],
        });
      } else {
        await assertSelection(page, isCollab, {
          anchorOffset: 0,
          anchorPath: [0, 0, 0],
          focusOffset: 12,
          focusPath: [0, 3, 0],
        });
      }
    }

    // Copy all the text
    await withExclusiveClipboardAccess(async () => {
      const clipboard = await copyToClipboard(page, isCollab);
      if (isRichText) {
        await assertHTML(
          page,
          isCollab,
          browserName,
          html`
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Copy + pasting?</span>
            </p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Sounds good!</span>
            </p>
          `,
        );
      } else {
        await assertHTML(
          page,
          isCollab,
          browserName,
          html`
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Copy + pasting?</span>
              <br />
              <br />
              <span data-lexical-text="true">Sounds good!</span>
            </p>
          `,
        );
      }

      // Paste after
      await page.keyboard.press('ArrowRight');
      await pasteFromClipboard(page, isCollab, clipboard);
      if (isRichText) {
        await assertHTML(
          page,
          isCollab,
          browserName,
          html`
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Copy + pasting?</span>
            </p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Sounds good!Copy + pasting?</span>
            </p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Sounds good!</span>
            </p>
          `,
        );
        await assertSelection(page, isCollab, {
          anchorOffset: 12,
          anchorPath: [4, 0, 0],
          focusOffset: 12,
          focusPath: [4, 0, 0],
        });
      } else {
        await assertHTML(
          page,
          isCollab,
          browserName,
          html`
            <p class="PlaygroundEditorTheme__paragraph" dir="auto">
              <span data-lexical-text="true">Copy + pasting?</span>
              <br />
              <br />
              <span data-lexical-text="true">Sounds good!Copy + pasting?</span>
              <br />
              <br />
              <span data-lexical-text="true">Sounds good!</span>
            </p>
          `,
        );
        await assertSelection(page, isCollab, {
          anchorOffset: 12,
          anchorPath: [0, 6, 0],
          focusOffset: 12,
          focusPath: [0, 6, 0],
        });
      }
    });
  });

  test(`Copy and paste heading`, async ({
    isPlainText,
    isCollab,
    page,
    browserName,
  }) => {
    test.fixme(isCollab && IS_LINUX, 'Flaky on Linux + Collab');
    test.skip(isPlainText);
    test.fixme(
      IS_LINUX && browserName === 'chromium',
      'Flaky on Linux + Chromium',
    );

    await focusEditor(page, isCollab);
    await page.keyboard.type('# Heading');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Some text');

    await moveToEditorBeginning(page, browserName);
    await page.keyboard.down('Shift');
    await moveToLineEnd(page);
    await page.keyboard.up('Shift');

    await withExclusiveClipboardAccess(async () => {
      const clipboard = await copyToClipboard(page, isCollab);

      await moveToEditorEnd(page, browserName);
      await page.keyboard.press('Enter');

      // Paste the content
      await pasteFromClipboard(page, isCollab, clipboard);

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <h1 class="PlaygroundEditorTheme__h1" dir="auto">
            <span data-lexical-text="true">Heading</span>
          </h1>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Some text</span>
          </p>
          <h1 class="PlaygroundEditorTheme__h1" dir="auto">
            <span data-lexical-text="true">Heading</span>
          </h1>
        `,
      );

      await assertSelection(page, isCollab, {
        anchorOffset: 7,
        anchorPath: [2, 0, 0],
        focusOffset: 7,
        focusPath: [2, 0, 0],
      });
    });
  });

  test('Copy and paste an inline element into a leaf node', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    // Root
    //   |- Paragraph
    //      |- Link
    //         |- Text "Hello"
    //      |- Text "World"
    await page.keyboard.type('Hello');
    await selectAll(page, isCollab, browserName);
    await click(page, isCollab, '.link');
    await click(page, isCollab, '.link-confirm');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Space');
    await page.keyboard.type('World');

    await selectAll(page, isCollab, browserName);

    await withExclusiveClipboardAccess(async () => {
      const clipboard = await copyToClipboard(page, isCollab);

      await page.keyboard.press('ArrowRight');

      await pasteFromClipboard(page, isCollab, clipboard);
    });

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
            <span data-lexical-text="true">Hello</span>
          </a>
          <span data-lexical-text="true">World</span>
          <a
            class="PlaygroundEditorTheme__link"
            href="https://"
            rel="noreferrer">
            <span data-lexical-text="true">Hello</span>
          </a>
          <span data-lexical-text="true">World</span>
        </p>
      `,
    );
  });

  test('Copy + paste multi-line plain text into rich text produces separate paragraphs', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await page.keyboard.type('# Hello ');
    await pasteFromClipboard(page, isCollab, {
      'text/plain': 'world\nAnd text below',
    });
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <h1 class="PlaygroundEditorTheme__h1" dir="auto">
          <span data-lexical-text="true">Hello world</span>
        </h1>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">And text below</span>
        </p>
      `,
    );
  });

  test('Copy and paste paragraph into quote', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    await page.keyboard.type('Hello world');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Some text');

    await selectAll(page, isCollab, browserName);

    await withExclusiveClipboardAccess(async () => {
      const clipboard = await copyToClipboard(page, isCollab);

      await page.keyboard.type('> ');

      await pasteFromClipboard(page, isCollab, clipboard);
    });
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <blockquote class="PlaygroundEditorTheme__quote" dir="auto">
          <span data-lexical-text="true">Hello world</span>
        </blockquote>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Some text</span>
        </p>
      `,
    );
  });

  test('Process font-size from content copied from Google Docs/MS Word', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1e6b36e2-7fff-9788-e6e2-d502cc6babbf"><p dir="ltr" style="line-height:1.56;margin-top:10pt;margin-bottom:0pt;"><span style="font-size:24pt;font-family:Lato,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Random text at </span><span style="font-size:36pt;font-family:Lato,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">36 pt</span></p></b>`,
    };

    await withExclusiveClipboardAccess(async () => {
      await pasteFromClipboard(page, isCollab, clipboard);

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span style="font-size: 24pt" data-lexical-text="true">
              Random text at
            </span>
            <span style="font-size: 36pt" data-lexical-text="true">36 pt</span>
          </p>
        `,
      );
    });
  });

  test('test font-size in pt and px both are processed correctly', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    const clipboard = {
      'text/html': `<meta charset='utf-8'><meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-2d2ed25f-7fff-2f5a-2422-f7e624a743db"><p dir="ltr" style="line-height:1.56;margin-top:10pt;margin-bottom:0pt;"><span style="font-size:24px;font-family:Lato,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Text in 24px</span></p><p dir="ltr" style="line-height:1.56;margin-top:10pt;margin-bottom:0pt;"><span style="font-size:36pt;font-family:Lato,sans-serif;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Text in 36pt</span></p></b>`,
    };

    await withExclusiveClipboardAccess(async () => {
      await pasteFromClipboard(page, isCollab, clipboard);

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span style="font-size: 24px;" data-lexical-text="true">
              Text in 24px
            </span>
          </p>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span style="font-size: 36pt;" data-lexical-text="true">
              Text in 36pt
            </span>
          </p>
        `,
      );
    });
  });
});
