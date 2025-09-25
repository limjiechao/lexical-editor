/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {paste} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  click,
  evaluate,
  expect,
  focusEditor,
  initialize,
  mouseMoveToSelector,
  pasteFromClipboard,
  test,
  waitForSelector,
  withExclusiveClipboardAccess,
} from '../utils/index.mjs';

test.describe('CodeActionMenu', () => {
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
  test('Can copy code, when click `Copy` button', async ({
    page,
    context,
    isPlainText,
    browserName,
    isCollab,
  }) => {
    test.skip(true);

    await focusEditor(page, isCollab);
    await page.keyboard.type('``` ');
    await page.keyboard.press('Space');
    await page.keyboard.type(`const a = 'Hello'`);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.type(`const b = 'World'`);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      `
        <code
          class=\"PlaygroundEditorTheme__code\"
          dir=\"ltr\"
          spellcheck=\"false\"
          data-gutter=\"123\"
          data-highlight-language=\"javascript\">
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenAttr\" data-lexical-text=\"true\">
            const
          </span>
          <span data-lexical-text=\"true\">a</span>
          <span class=\"PlaygroundEditorTheme__tokenOperator\" data-lexical-text=\"true\">
            =
          </span>
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenSelector\" data-lexical-text=\"true\">
            'Hello'
          </span>
          <br />
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenAttr\" data-lexical-text=\"true\">
            const
          </span>
          <span data-lexical-text=\"true\">b</span>
          <span class=\"PlaygroundEditorTheme__tokenOperator\" data-lexical-text=\"true\">
            =
          </span>
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenSelector\" data-lexical-text=\"true\">
            'World'
          </span>
          <br />
          <span data-lexical-text=\"true\"></span>
        </code>
      `,
    );

    await mouseMoveToSelector(
      page,
      isCollab,
      'code.PlaygroundEditorTheme__code',
    );

    await withExclusiveClipboardAccess(async () => {
      if (browserName === 'chromium') {
        await context.grantPermissions(['clipboard-write']);
        await click(page, isCollab, 'button[aria-label=copy]');
        await paste(page);
        await context.clearPermissions();
      } else {
        await waitForSelector(page, isCollab, 'button[aria-label=copy]');

        const copiedText = await evaluate(page, isCollab, () => {
          let text = null;

          navigator.clipboard._writeText = navigator.clipboard.writeText;
          navigator.clipboard.writeText = function (data) {
            text = data;
            this._writeText(data);
          };
          document.querySelector('button[aria-label=copy]').click();

          return text;
        });

        await pasteFromClipboard(page, isCollab, {
          'text/plain': copiedText,
        });
      }
    });

    await assertHTML(
      page,
      isCollab,
      browserName,
      `
          <code
          class=\"PlaygroundEditorTheme__code\"
          dir=\"ltr\"
          spellcheck=\"false\"
          data-gutter=\"12345\"
          data-highlight-language=\"javascript\">
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenAttr\" data-lexical-text=\"true\">
            const
          </span>
          <span data-lexical-text=\"true\">a</span>
          <span class=\"PlaygroundEditorTheme__tokenOperator\" data-lexical-text=\"true\">
            =
          </span>
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenSelector\" data-lexical-text=\"true\">
            'Hello'
          </span>
          <br />
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenAttr\" data-lexical-text=\"true\">
            const
          </span>
          <span data-lexical-text=\"true\">b</span>
          <span class=\"PlaygroundEditorTheme__tokenOperator\" data-lexical-text=\"true\">
            =
          </span>
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenSelector\" data-lexical-text=\"true\">
            'World'
          </span>
          <br />
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenAttr\" data-lexical-text=\"true\">
            const
          </span>
          <span data-lexical-text=\"true\">a</span>
          <span class=\"PlaygroundEditorTheme__tokenOperator\" data-lexical-text=\"true\">
            =
          </span>
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenSelector\" data-lexical-text=\"true\">
            'Hello'
          </span>
          <br />
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenAttr\" data-lexical-text=\"true\">
            const
          </span>
          <span data-lexical-text=\"true\">b</span>
          <span class=\"PlaygroundEditorTheme__tokenOperator\" data-lexical-text=\"true\">
            =
          </span>
          <span data-lexical-text=\"true\"></span>
          <span class=\"PlaygroundEditorTheme__tokenSelector\" data-lexical-text=\"true\">
            'World'
          </span>
          <br />
          <span data-lexical-text=\"true\"></span>
        </code>
      `,
    );
  });

  test('In the case of syntactically correct code, when the `prettier` button is clicked, the code needs to be properly formatted', async ({
    page,
    isCollab,
    isPlainText,
    browserName,
  }) => {
    test.skip(isCollab);
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await page.keyboard.type('``` ');
    await page.keyboard.press('Space');
    await page.keyboard.type(`const  luci  =  'Hello World'`);

    await assertHTML(
      page,
      isCollab,
      browserName,
      `
        <code
          class="PlaygroundEditorTheme__code"
          dir="auto"
          spellcheck="false"
          data-gutter="1"
          data-language="javascript"
          data-highlight-language="javascript">
          <span data-lexical-text="true"></span>
          <span class="PlaygroundEditorTheme__tokenAttr" data-lexical-text="true">
            const
          </span>
          <span data-lexical-text="true">luci</span>
          <span class="PlaygroundEditorTheme__tokenOperator" data-lexical-text="true">
            =
          </span>
          <span data-lexical-text="true"></span>
          <span class="PlaygroundEditorTheme__tokenSelector" data-lexical-text="true">
            'Hello World'
          </span>
        </code>
      `,
    );

    await mouseMoveToSelector(
      page,
      isCollab,
      'code.PlaygroundEditorTheme__code',
    );
    await click(page, isCollab, 'button[aria-label=prettier]');

    await page.waitForTimeout(3000);

    await assertHTML(
      page,
      isCollab,
      browserName,
      `
        <code
        class="PlaygroundEditorTheme__code"
        dir="auto"
        spellcheck="false"
        data-gutter="12"
        data-language="javascript"
        data-highlight-language="javascript">
          <span class="PlaygroundEditorTheme__tokenAttr" data-lexical-text="true">
            const
          </span>
          <span data-lexical-text="true">luci</span>
          <span class="PlaygroundEditorTheme__tokenOperator" data-lexical-text="true">
            =
          </span>
          <span data-lexical-text="true"></span>
          <span class="PlaygroundEditorTheme__tokenSelector" data-lexical-text="true">
            "Hello World"
          </span>
          <span
            class="PlaygroundEditorTheme__tokenPunctuation"
            data-lexical-text="true">
            ;
          </span>
          <br />
          <br />
        </code>
      `,
    );
  });

  test('If the code syntax is incorrect, an error message should be displayed', async ({
    page,
    isCollab,
    isPlainText,
    browserName,
  }) => {
    test.skip(isCollab);
    test.skip(isPlainText);
    await focusEditor(page, isCollab);
    await page.keyboard.type('``` ');
    await page.keyboard.press('Space');
    await page.keyboard.type(`cons  luci  =  'Hello World'`);

    await assertHTML(
      page,
      isCollab,
      browserName,
      `
        <code
          class="PlaygroundEditorTheme__code"
          dir="auto"
          spellcheck="false"
          data-gutter="1"
          data-language="javascript"
          data-highlight-language="javascript">
          <span data-lexical-text="true">cons luci</span>
          <span class="PlaygroundEditorTheme__tokenOperator" data-lexical-text="true">
            =
          </span>
          <span data-lexical-text="true"></span>
          <span class="PlaygroundEditorTheme__tokenSelector" data-lexical-text="true">
            'Hello World'
          </span>
        </code>
      `,
    );

    await mouseMoveToSelector(
      page,
      isCollab,
      'code.PlaygroundEditorTheme__code',
    );
    await click(page, isCollab, 'button[aria-label=prettier]');

    await page.waitForTimeout(3000);

    expect(await page.$('i.format.prettier-error')).toBeTruthy();

    const errorTips = await page.$('pre.code-error-tips');

    expect(errorTips).toBeTruthy();

    const tips = await evaluate(page, isCollab, () => {
      return document.querySelector('pre.code-error-tips').innerText;
    });

    expect(tips).toBe(
      'Missing semicolon. (1:6)\n' +
        "> 1 |  cons  luci  =  'Hello World'\n" +
        '    |      ^',
    );
  });
});
