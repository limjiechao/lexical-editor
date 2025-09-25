/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  assertHTML,
  click,
  expect,
  focusEditor,
  getPageOrFrame,
  html,
  initialize,
  test,
  withExclusiveClipboardAccess,
} from '../utils/index.mjs';

test.use({
  launchOptions: {
    firefoxUserPrefs: {
      'dom.events.asyncClipboard.readText': true,
      'dom.events.testing.asyncClipboard': true,
    },
  },
});
test.describe('Share', () => {
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
  test('is disabled in collab', async ({page, isCollab}) => {
    test.skip(!isCollab);
    const leftFrame = getPageOrFrame(page, isCollab);
    await expect(leftFrame.locator('.action-button.share')).toBeDisabled();
  });
  test('can share the editor state', async ({page, isCollab, browserName}) => {
    test.skip(isCollab);

    await focusEditor(page, isCollab);
    const fooHTML = html`
      <p class="PlaygroundEditorTheme__paragraph" dir="auto">
        <span data-lexical-text="true">foo</span>
      </p>
    `;
    await page.keyboard.type('foo');
    await assertHTML(page, isCollab, browserName, fooHTML);

    await withExclusiveClipboardAccess(async () => {
      if (browserName === 'chromium') {
        await page
          .context()
          .grantPermissions(['clipboard-read', 'clipboard-write']);
      }
      expect(page.url()).not.toMatch(/#doc=/);
      await click(page, isCollab, '.action-button.share');
      await getPageOrFrame(page, isCollab)
        .getByRole('alert')
        .getByText('URL copied to clipboard');
      const fooUrl = page.url();
      expect(fooUrl).toMatch(/#doc=/);
      if (browserName !== 'webkit') {
        expect(await page.evaluate('navigator.clipboard.readText()')).toEqual(
          fooUrl,
        );
      }
      if (browserName === 'chromium') {
        await page.context().clearPermissions();
      }
    });
    await focusEditor(page, isCollab);
    await page.keyboard.type('bar');
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
    // The URL also changed so we can just reload to get the copied state
    await page.reload();
    await focusEditor(page, isCollab);
    await assertHTML(page, isCollab, browserName, fooHTML);
  });
});
