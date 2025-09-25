/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  assertTableSelectionCoordinates,
  click,
  focusEditor,
  initialize,
  insertTable,
  selectCellsFromTableCords,
  test,
} from '../utils/index.mjs';

test.describe('Regression test #4697', () => {
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
    'repeated table selection results in table selection',
    {tag: '@flaky'},
    async ({page, isPlainText, isCollab}) => {
      test.skip(isPlainText);

      await focusEditor(page, isCollab);

      await insertTable(page, isCollab, 4, 4);

      await click(page, isCollab, '.PlaygroundEditorTheme__tableCell');
      await selectCellsFromTableCords(
        page,
        isCollab,
        {x: 1, y: 1},
        {x: 2, y: 2},
        false,
        false,
      );
      await page.pause();

      await selectCellsFromTableCords(
        page,
        isCollab,
        {x: 2, y: 1},
        {x: 2, y: 2},
        false,
        false,
      );
      await page.pause();

      await assertTableSelectionCoordinates(page, isCollab, {
        anchor: {x: 2, y: 1},
        focus: {x: 2, y: 2},
      });
    },
  );
});
