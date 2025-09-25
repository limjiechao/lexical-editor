/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {moveToEditorEnd} from '../keyboardShortcuts/index.mjs';
import {
  assertSelection,
  focusEditor,
  initialize,
  insertSampleImage,
  insertTable,
  test,
} from '../utils/index.mjs';

function hasWrapper(tableHorizontalScroll) {
  return tableHorizontalScroll ? [0] : [];
}

test.describe('Regression test #6870', () => {
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
  test('left arrow moves selection around decorators near tables', async ({
    page,
    isPlainText,
    isCollab,
    tableHorizontalScroll,
    browserName,
  }) => {
    test.skip(isCollab);
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    await insertTable(page, isCollab, 2, 1);
    await moveToEditorEnd(page, browserName);
    await insertSampleImage(page, isCollab);

    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [2],
      focusOffset: 1,
      focusPath: [2],
    });

    // First ArrowLeft moves inside the image
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [2],
      focusOffset: 0,
      focusPath: [2],
    });

    await page.keyboard.press('ArrowLeft');

    // Moves into the last cell of the table
    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [1, ...hasWrapper(tableHorizontalScroll), 2, 0, 0],
      focusOffset: 0,
      focusPath: [1, ...hasWrapper(tableHorizontalScroll), 2, 0, 0],
    });
  });
  test('left arrow expands selection around decorators near tables', async ({
    page,
    isPlainText,
    isCollab,
    tableHorizontalScroll,
    browserName,
  }) => {
    test.skip(isCollab);
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    await insertTable(page, isCollab, 2, 1);
    await moveToEditorEnd(page, browserName);
    await insertSampleImage(page, isCollab);

    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [2],
      focusOffset: 1,
      focusPath: [2],
    });

    await page.keyboard.down('Shift');
    // Only one press is needed here, it won't move into the node
    await page.keyboard.press('ArrowLeft');

    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [2],
      focusOffset: 0,
      focusPath: [2],
    });

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.up('Shift');

    // Include the whole table
    await assertSelection(page, isCollab, {
      anchorOffset: 1,
      anchorPath: [2],
      focusOffset: 1,
      focusPath: [],
    });
  });
});
