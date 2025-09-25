/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {
  click,
  expect,
  focusEditor,
  initialize,
  insertTable,
  locate,
  mergeTableCells,
  selectCellsFromTableCords,
  test,
  unmergeTableCell,
} from '../utils/index.mjs';

test.describe('Regression test #4876', () => {
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
  test('unmerging cells should add cells to correct rows', async ({
    page,
    isPlainText,
    isCollab,
  }) => {
    test.skip(isPlainText);

    await focusEditor(page, isCollab);

    await insertTable(page, isCollab, 4, 4);

    await click(page, isCollab, '.PlaygroundEditorTheme__tableCell');
    await selectCellsFromTableCords(
      page,
      isCollab,
      {x: 0, y: 1},
      {x: 1, y: 3},
      true,
      false,
    );

    await mergeTableCells(page, isCollab);

    await unmergeTableCell(page, isCollab);

    const tableRow = await locate(page, isCollab, 'tr');
    expect(await tableRow.count()).toBe(4);
    for (let i = 0; i < 4; i++) {
      const tableCells = tableRow.nth(i).locator('th, td');
      expect(await tableCells.count()).toBe(4);
    }
  });
});
