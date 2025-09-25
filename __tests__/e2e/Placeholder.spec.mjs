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
  expect,
  focusEditor,
  html,
  initialize,
  test,
  textContent,
} from '../utils/index.mjs';

test.describe('Placeholder', () => {
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
  test(`Displays a placeholder when no content is present`, async ({
    page,
    isCollab,
    isRichText,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    const content = await textContent(
      page,
      isCollab,
      '.ContentEditable__placeholder',
    );
    if (isCollab) {
      expect(content).toBe('Enter some collaborative rich text...');
    } else if (isRichText) {
      expect(content).toBe('Enter some rich text...');
    } else {
      expect(content).toBe('Enter some plain text...');
    }

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
  });
});
