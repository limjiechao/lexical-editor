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
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  evaluate,
  focusEditor,
  html,
  initialize,
  test,
} from '../utils/index.mjs';

test.describe('Extensions', () => {
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
  test(`document.execCommand("insertText")`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await evaluate(
      page,
      isCollab,
      () => {
        document.execCommand('insertText', false, 'foo');
      },
      [],
    );
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">foo</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 3,
      anchorPath: [0, 0, 0],
      focusOffset: 3,
      focusPath: [0, 0, 0],
    });
  });

  test(`ClipboardEvent("paste")`, async ({page, browserName, isCollab}) => {
    // Pasting this way doesn't work in FF due to content
    // privacy reasons.
    if (browserName === 'firefox') {
      return;
    }
    await focusEditor(page, isCollab);

    await evaluate(
      page,
      isCollab,
      () => {
        function paste() {
          const dataTransfer = new DataTransfer();
          function dispatchPaste(target, text) {
            dataTransfer.setData('text/plain', text);
            target.dispatchEvent(
              new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dataTransfer,
              }),
            );
            dataTransfer.clearData();
          }
          return dispatchPaste;
        }

        const editor = document.querySelector('div[contenteditable="true"]');
        const dispatchPaste = paste();
        dispatchPaste(editor, 'foo');
      },
      [],
    );
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">foo</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 3,
      anchorPath: [0, 0, 0],
      focusOffset: 3,
      focusPath: [0, 0, 0],
    });

    await evaluate(page, isCollab, () => {
      function paste() {
        const dataTransfer = new DataTransfer();
        function dispatchPaste(target, text) {
          dataTransfer.setData('text/plain', text);
          target.dispatchEvent(
            new ClipboardEvent('paste', {
              bubbles: true,
              cancelable: true,
              clipboardData: dataTransfer,
            }),
          );
          dataTransfer.clearData();
        }
        return dispatchPaste;
      }

      const editor = document.querySelector('div[contenteditable="true"]');
      const dispatchPaste = paste();
      dispatchPaste(editor, 'bar');
    });
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">foobar</span>
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

  test(`ClipboardEvent("paste") + document.execCommand("insertText")`, async ({
    page,
    browserName,
    isCollab,
  }) => {
    await focusEditor(page, isCollab);

    await evaluate(page, isCollab, () => {
      const editor = document.querySelector('div[contenteditable="true"]');
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', 'foo');
      editor.dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dataTransfer,
        }),
      );
      document.execCommand('InsertText', false, 'bar');
    });

    // Pasting this way doesn't work in FF due to content
    // privacy reasons. So we only look for the execCommand output.
    if (browserName === 'firefox') {
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">bar</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 3,
        anchorPath: [0, 0, 0],
        focusOffset: 3,
        focusPath: [0, 0, 0],
      });
    } else {
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">foobar</span>
          </p>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 6,
        anchorPath: [0, 0, 0],
        focusOffset: 6,
        focusPath: [0, 0, 0],
      });
    }
  });

  test(`document.execCommand("insertText") with selection`, async ({
    page,
    isCollab,
    isPlainText,
    browserName,
  }) => {
    // This test is flaky in collab #3915
    test.fixme(isCollab);
    test.skip(isPlainText);
    await focusEditor(page, isCollab);

    await page.keyboard.type('hello world');
    await page.keyboard.press('Enter');
    await page.keyboard.type('asd t');
    await page.keyboard.press('ArrowUp');

    // Selection is on the last paragraph
    await evaluate(
      page,
      isCollab,
      async () => {
        const editor = document.querySelector('div[contenteditable="true"]');
        const selection = window.getSelection();
        const secondParagraphTextNode =
          editor.firstChild.nextSibling.firstChild.firstChild;
        selection.setBaseAndExtent(
          secondParagraphTextNode,
          0,
          secondParagraphTextNode,
          3,
        );

        await new Promise((resolve) => {
          setTimeout(() => {
            document.execCommand('insertText', false, 'and');
            resolve();
          }, 50);
        });
      },
      [],
    );
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">hello world</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">and t</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 3,
      anchorPath: [1, 0, 0],
      focusOffset: 3,
      focusPath: [1, 0, 0],
    });
  });

  test('document.execCommand("insertText") with all text backward selection', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Paragraph 1');
    await moveToEditorEnd(page, browserName);
    await page.keyboard.down('Shift');
    await moveToEditorBeginning(page, browserName);
    await page.keyboard.up('Shift');

    await assertSelection(page, isCollab, {
      anchorOffset: 11,
      anchorPath: [0, 0, 0],
      focusOffset: 0,
      focusPath: [0, 0, 0],
    });

    await evaluate(
      page,
      isCollab,
      () => {
        document.execCommand('insertText', false, 'New text');
      },
      [],
    );
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">New text</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 8,
      anchorPath: [0, 0, 0],
      focusOffset: 8,
      focusPath: [0, 0, 0],
    });
  });

  test('document.execCommand("insertText") with all text forward selection', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await page.keyboard.type('Paragraph 1');
    await moveToEditorBeginning(page, browserName);
    await page.keyboard.down('Shift');
    await moveToEditorEnd(page, browserName);
    await page.keyboard.up('Shift');

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [0, 0, 0],
      focusOffset: 11,
      focusPath: [0, 0, 0],
    });

    await evaluate(
      page,
      isCollab,
      () => {
        document.execCommand('insertText', false, 'New text');
      },
      [],
    );
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">New text</span>
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 8,
      anchorPath: [0, 0, 0],
      focusOffset: 8,
      focusPath: [0, 0, 0],
    });
  });
});
