/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  applyCodeBlock,
  applyHeading,
  applyNormalFormat,
  applyQuoteBlock,
  centerAlign,
  clearFormatting,
  decreaseFontSize,
  increaseFontSize,
  indent,
  justifyAlign,
  leftAlign,
  outdent,
  rightAlign,
  selectCharacters,
  toggleBold,
  toggleBulletList,
  toggleCapitalize,
  toggleInsertCodeBlock,
  toggleItalic,
  toggleLowercase,
  toggleNumberedList,
  toggleStrikethrough,
  toggleSubscript,
  toggleSuperscript,
  toggleUnderline,
  toggleUppercase,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  evaluate,
  expect,
  focusEditor,
  html,
  initialize,
  test,
  textContent,
} from '../utils/index.mjs';

const formatTestCases = [
  {
    applyShortcut: (page) => applyNormalFormat(page),
    canToggle: false,
    format: 'Normal',
  },
  {
    applyShortcut: (page) => applyHeading(page, 1),
    canToggle: false,
    format: 'Heading 1',
  },
  {
    applyShortcut: (page) => applyHeading(page, 2),
    canToggle: false,
    format: 'Heading 2',
  },
  {
    applyShortcut: (page) => applyHeading(page, 3),
    canToggle: false,
    format: 'Heading 3',
  },
  {
    applyShortcut: (page) => toggleBulletList(page),
    canToggle: true,
    format: 'Bulleted List',
  },
  {
    applyShortcut: (page) => toggleNumberedList(page),
    canToggle: true,
    format: 'Numbered List',
  },
  {
    applyShortcut: (page) => applyQuoteBlock(page),
    canToggle: false,
    format: 'Quote',
  },
  {
    applyShortcut: (page) => applyCodeBlock(page),
    canToggle: false,
    format: 'Code Block',
  },
];

const alignmentTestCases = [
  {
    alignment: 'Left Align',
    applyShortcut: (page) => leftAlign(page),
  },
  {
    alignment: 'Center Align',
    applyShortcut: (page) => centerAlign(page),
  },
  {
    alignment: 'Right Align',
    applyShortcut: (page) => rightAlign(page),
  },
  {
    alignment: 'Justify Align',
    applyShortcut: (page) => justifyAlign(page),
  },
];

const additionalStylesTestCases = [
  {
    applyShortcut: (page) => toggleStrikethrough(page),
    dropdownItemIndex: 0,
    style: 'Strikethrough',
  },
  {
    applyShortcut: (page) => toggleSubscript(page),
    dropdownItemIndex: 1,
    style: 'Subscript',
  },
  {
    applyShortcut: (page) => toggleSuperscript(page),
    dropdownItemIndex: 2,
    style: 'Superscript',
  },
  {
    applyShortcut: (page) => toggleCapitalize(page),
    dropdownItemIndex: 4,
    style: 'Capitalize',
  },
  {
    applyShortcut: (page) => toggleLowercase(page),
    dropdownItemIndex: 5,
    style: 'Lowercase',
  },
  {
    applyShortcut: (page) => toggleUppercase(page),
    dropdownItemIndex: 6,
    style: 'Uppercase',
  },
];

const DEFAULT_FORMAT = 'Normal';

const getSelectedFormat = async (page, isCollab) => {
  return await textContent(
    page,
    isCollab,
    '.toolbar-item.block-controls > .text.dropdown-button-text',
  );
};

const isDropdownItemActive = async (page, isCollab, dropdownItemIndex) => {
  return await evaluate(
    page,
    isCollab,
    async (_dropdownItemIndex) => {
      await document
        .querySelector(
          'button[aria-label="Formatting options for additional text styles"]',
        )
        .click();

      const isActive = document
        .querySelector('.dropdown')
        .children[_dropdownItemIndex].classList.contains('active');

      await document
        .querySelector(
          'button[aria-label="Formatting options for additional text styles"]',
        )
        .click();

      return isActive;
    },
    dropdownItemIndex,
  );
};

test.describe('Keyboard shortcuts', () => {
  test.beforeEach(
    ({
      environment,
      browserName,
      tableHorizontalScroll,
      isPlainText,
      isRichText,
      isCollab,
      legacyEvents,
      page,
    }) => {
      test.skip(isPlainText);
      return initialize({
        browserName,
        environment,
        isCollab,
        isRichText,
        legacyEvents,
        page,
        tableHorizontalScroll,
      });
    },
  );

  formatTestCases.forEach(({format, applyShortcut, canToggle}) => {
    test(`Can use ${format} format with the shortcut`, async ({
      page,
      isCollab,
      isPlainText,
    }) => {
      await focusEditor(page, isCollab);

      if (format === DEFAULT_FORMAT) {
        // Apply a different format first
        await applyHeading(page, 1);
      }

      await applyShortcut(page);

      expect(await getSelectedFormat(page, isCollab)).toBe(format);

      if (canToggle) {
        await applyShortcut(page);

        // Should revert back to the default format
        expect(await getSelectedFormat(page, isCollab)).toBe(DEFAULT_FORMAT);
      }
    });
  });

  alignmentTestCases.forEach(({alignment, applyShortcut}, index) => {
    test(`Can use ${alignment} with the shortcut`, async ({
      page,
      isCollab,
      isPlainText,
    }) => {
      await focusEditor(page, isCollab);
      await applyShortcut(page);

      const selectedAlignment = await textContent(
        page,
        isCollab,
        '.toolbar-item.spaced.alignment > .text.dropdown-button-text',
      );

      expect(selectedAlignment).toBe(alignment);
    });
  });

  additionalStylesTestCases.forEach(
    ({applyShortcut, style, dropdownItemIndex}) => {
      test(`Can use ${style} with the shortcut`, async ({
        page,
        isPlainText,
        isCollab,
      }) => {
        await focusEditor(page, isCollab);
        await applyShortcut(page);

        expect(
          await isDropdownItemActive(page, isCollab, dropdownItemIndex),
        ).toBe(true);

        // Toggle the style off and check if it's off
        await focusEditor(page, isCollab);
        await applyShortcut(page);
        expect(
          await isDropdownItemActive(page, isCollab, dropdownItemIndex),
        ).toBe(false);
      });
    },
  );

  test('Can increase and decrease font size with the shortcuts', async ({
    page,
    isCollab,
    isPlainText,
  }) => {
    await focusEditor(page, isCollab);
    await increaseFontSize(page);

    const getFontSize = async () => {
      return await evaluate(page, isCollab, () => {
        return document.querySelector('.font-size-input').value;
      });
    };

    expect(await getFontSize()).toBe('17');
    await decreaseFontSize(page);
    expect(await getFontSize()).toBe('15');
  });

  test('Can clear formatting with the shortcut', async ({
    page,
    isPlainText,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    // Apply some formatting first
    await page.keyboard.type('abc');
    await selectCharacters(page, 'left', 3);

    await assertSelection(page, isCollab, {
      anchorOffset: 3,
      anchorPath: [0, 0, 0],
      focusOffset: 0,
      focusPath: [0, 0, 0],
    });

    await toggleBold(page);
    await toggleItalic(page);
    await toggleUnderline(page);
    await toggleStrikethrough(page);
    await toggleSubscript(page);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <sub data-lexical-text="true">
            <strong
              class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__textSubscript">
              abc
            </strong>
          </sub>
        </p>
      `,
    );

    await clearFormatting(page);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">abc</span>
        </p>
      `,
    );
  });

  test('Can toggle Insert code snippet with the shortcut', async ({
    page,
    isPlainText,
    isCollab,
  }) => {
    await focusEditor(page, isCollab);

    const isCodeBlockActive = async () => {
      return await evaluate(page, isCollab, () => {
        return document
          .querySelector(`button[aria-label="Insert code snippet"]`)
          .classList.contains('active');
      });
    };

    // Toggle the code block on
    await toggleInsertCodeBlock(page);
    expect(await isCodeBlockActive()).toBe(true);

    // Toggle the code block off
    await toggleInsertCodeBlock(page);
    expect(await isCodeBlockActive()).toBe(false);
  });

  test('Can indent and outdent with the shortcuts', async ({
    page,
    isCollab,
    isPlainText,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await page.keyboard.type('abc');
    await indent(page, 3);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(120px);">
          <span data-lexical-text="true">abc</span>
        </p>
      `,
    );

    await outdent(page, 2);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(40px);">
          <span data-lexical-text="true">abc</span>
        </p>
      `,
    );

    await outdent(page, 1);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto" style="">
          <span data-lexical-text="true">abc</span>
        </p>
      `,
    );
  });
});
