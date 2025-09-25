/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {expect} from '@playwright/test';

import {click, focusEditor, initialize, test} from '../utils/index.mjs';

test.describe('Lock', () => {
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
  test('Placeholder remains when non-editable', async ({
    page,
    isPlainText,
    isCollab,
  }) => {
    const placeholder = `Enter some ${
      isCollab ? 'collaborative rich' : isPlainText ? 'plain' : 'rich'
    } text...`;
    const pageOrFrame = isCollab ? page.frame('left') : page;
    await focusEditor(page, isCollab);
    expect(await pageOrFrame.innerHTML('.editor-container')).toContain(
      placeholder,
    );

    await click(page, isCollab, '.action-button.lock');
    expect(await pageOrFrame.innerHTML('.editor-container')).toContain(
      placeholder,
    );
  });
});
