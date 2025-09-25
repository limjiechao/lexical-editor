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
  mergeTableCells,
  selectCellsFromTableCords,
  test,
} from '../utils/index.mjs';

test.describe('Regression test #4872', () => {
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
    'merging two full rows does not break table selection',
    {tag: '@flaky'},
    async ({page, isPlainText, isCollab}) => {
      test.skip(isPlainText);

      await focusEditor(page, isCollab);

      await insertTable(page, isCollab, 5, 5);

      await click(page, isCollab, '.PlaygroundEditorTheme__tableCell');
      await selectCellsFromTableCords(
        page,
        isCollab,
        {x: 0, y: 1},
        {x: 4, y: 2},
        true,
        false,
      );

      await mergeTableCells(page, isCollab);

      await selectCellsFromTableCords(
        page,
        isCollab,
        {x: 1, y: 4},
        {x: 2, y: 4},
        false,
        false,
      );

      await assertTableSelectionCoordinates(page, isCollab, {
        anchor: {x: 1, y: 4},
        focus: {x: 2, y: 4},
      });
    },
  );
});
