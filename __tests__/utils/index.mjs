/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {expect, test as base} from '@playwright/test';
import * as glob from 'glob';
import {randomUUID} from 'node:crypto';
import prettier from 'prettier';
import * as lockfile from 'proper-lockfile';
import {URLSearchParams} from 'url';

import {PORTS} from '../../playwright.test-profiles.mjs';
import {selectAll} from '../keyboardShortcuts/index.mjs';

function findAsset(pattern) {
  const prefix = '/build';
  const resolvedPattern = `${prefix}/assets/${pattern}`;
  for (const fn of glob.sync(resolvedPattern, {windowsPathsNoEscape: true})) {
    return fn.replaceAll('\\', '/').slice(prefix.length);
  }
  throw new Error(`Missing asset at ${resolvedPattern}`);
}

export const IS_MAC = process.platform === 'darwin';
export const IS_WINDOWS = process.platform === 'win32';
export const IS_LINUX = !IS_MAC && !IS_WINDOWS;
export const SAMPLE_SVG_URL = '/logo.svg';
export function sampleFlowerImageUrl(environment) {
  return environment.endsWith('_dev')
    ? '/src/images/yellow-flower.jpg'
    : findAsset('yellow-flower*.jpg');
}
export function sampleLandscapeImageUrl(environment) {
  return environment.endsWith('_dev')
    ? '/src/images/landscape.jpg'
    : findAsset('landscape*.jpg');
}
export const LEXICAL_IMAGE_BASE64 =
  'data:image/png;base64,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';

function wrapAndSlowDown(method, delay) {
  return async function () {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return method.apply(this, arguments);
  };
}

export function wrapTableHtml(expected, {ignoreClasses = false} = {}) {
  return html`
    ${expected
      .replace(
        /<table([^>]*)(dir="\w+")([^>]*)>/g,
        `<div $2${
          ignoreClasses
            ? ''
            : ' class="PlaygroundEditorTheme__tableScrollableWrapper"'
        }><table$1$3>`,
      )
      .replace(/<\/table>/g, '</table></div>')}
  `;
}

export async function initialize({
  browserName,
  page,
  environment,
  isCollab,
  isAutocomplete,
  isCharLimit,
  isCharLimitUtf8,
  isMaxLength,
  isRichText = true,
  hasCodeBlocks = true,
  hasCodeSnippets = true,
  hasComments = true,
  hasEquations = true,
  hasLinkAttributes,
  hasSampleImage = true,
  hasSpeechToText = true,
  legacyEvents = false,
  selectionAlwaysOnDisplay,
  shouldAllowHighlightingWithBrackets,
  shouldUseLexicalContextMenu,
  showNestedEditorTreeView,
  tableCellBackgroundColor,
  tableCellMerge,
  tableHorizontalScroll = true,
}) {
  // Tests with legacy events often fail to register keypress, so
  // slowing it down to reduce flakiness
  if (legacyEvents) {
    page.keyboard.type = wrapAndSlowDown(page.keyboard.type, 50);
    page.keyboard.press = wrapAndSlowDown(page.keyboard.press, 50);
  }

  const appSettings = {};
  appSettings.isRichText = isRichText;
  appSettings.emptyEditor = true;
  appSettings.disableBeforeInput = legacyEvents;
  appSettings.tableHorizontalScroll = tableHorizontalScroll;
  if (isCollab) {
    appSettings.isCollab = !!isCollab;
    appSettings.useCollabV2 = isCollab === 2;
    appSettings.collabId = randomUUID();
  }
  if (showNestedEditorTreeView === undefined) {
    appSettings.showNestedEditorTreeView = true;
  }
  appSettings.isAutocomplete = !!isAutocomplete;
  appSettings.isCharLimit = !!isCharLimit;
  appSettings.isCharLimitUtf8 = !!isCharLimitUtf8;
  appSettings.isMaxLength = !!isMaxLength;
  appSettings.hasCodeBlocks = !!hasCodeBlocks;
  appSettings.hasCodeSnippets = !!hasCodeSnippets;
  appSettings.hasComments = !!hasComments;
  appSettings.hasEquations = !!hasEquations;
  appSettings.hasLinkAttributes = !!hasLinkAttributes;
  appSettings.hasSampleImage = !!hasSampleImage;
  appSettings.hasSpeechToText = !!hasSpeechToText;
  if (tableCellMerge !== undefined) {
    appSettings.tableCellMerge = tableCellMerge;
  }
  if (tableCellBackgroundColor !== undefined) {
    appSettings.tableCellBackgroundColor = tableCellBackgroundColor;
  }
  appSettings.shouldUseLexicalContextMenu = !!shouldUseLexicalContextMenu;
  appSettings.shouldAllowHighlightingWithBrackets =
    !!shouldAllowHighlightingWithBrackets;

  appSettings.selectionAlwaysOnDisplay = !!selectionAlwaysOnDisplay;

  const urlParams = appSettingsToURLParams(appSettings);
  const url = `http://localhost:${PORTS[environment]}/${
    isCollab ? 'split/' : ''
  }?${urlParams.toString()}`;

  // Having more horizontal space prevents redundant text wraps for tests
  // which affects CMD+ArrowRight/Left navigation
  page.setViewportSize({height: 1000, width: isCollab ? 2500 : 1250});
  await page.goto(url);

  await exposeLexicalEditor(page, isCollab, browserName);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {boolean} isCollab
 * @param {string} browserName
 */
async function exposeLexicalEditor(page, isCollab, browserName) {
  if (isCollab) {
    await Promise.all(
      ['left', 'right'].map(async (name) => {
        const frameLocator = page.frameLocator(`[name="${name}"]`);
        await expect(
          frameLocator.locator('.action-button.connect'),
        ).toHaveAttribute('title', /Disconnect/);
        await expect(
          frameLocator.locator('[data-lexical-editor="true"] p'),
        ).toBeVisible();
      }),
    );

    // Ensure that they started up with the correct empty state
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
  }
  const leftFrame = getPageOrFrame(page, isCollab);
  await leftFrame.waitForSelector('.tree-view-output pre', {timeout: 3000});
  await leftFrame.evaluate(() => {
    window.lexicalEditor = document.querySelector(
      '[data-lexical-editor="true"]',
    ).__lexicalEditor;
  });
}

export const test = base.extend({
  environment: ['local_dev', {scope: 'worker'}],
  forEachWorker: [
    async function ({browserName, isCollab, environment}, use) {
      // This code runs before all the tests in the worker process.
      await use();
      // This code runs after all the tests in the worker process.
    },
    {auto: true, scope: 'worker'},
  ], // automatically starts for every worker.
  hasLinkAttributes: false,
  isCharLimit: false,
  isCharLimitUtf8: false,
  isCollab: [false, {option: true, scope: 'worker'}],
  isCollabV1: [false, {option: true, scope: 'worker'}],
  isCollabV2: [false, {option: true, scope: 'worker'}],
  isMaxLength: false,
  isPlainText: [false, {option: true, scope: 'worker'}],
  isRichText: [true, {option: true, scope: 'worker'}],
  legacyEvents: [false, {option: true, scope: 'worker'}],
  selectionAlwaysOnDisplay: false,
  shouldAllowHighlightingWithBrackets: false,
  shouldUseLexicalContextMenu: false,
  tableHorizontalScroll: [true, {option: true, scope: 'worker'}],
});

export {expect} from '@playwright/test';

function appSettingsToURLParams(appSettings) {
  const params = new URLSearchParams();
  Object.entries(appSettings).forEach(([setting, value]) => {
    params.append(setting, value);
  });
  return params;
}

export async function repeat(times, cb) {
  for (let i = 0; i < times; i++) {
    await cb();
  }
}

export async function clickSelectors(page, isCollab, selectors) {
  for (let i = 0; i < selectors.length; i++) {
    await click(page, isCollab, selectors[i]);
  }
}

function removeSafariLinebreakImgHack(actualHtml, browserName) {
  return browserName === 'webkit'
    ? actualHtml.replaceAll(
        /<img (?:[^>]+ )?data-lexical-linebreak="true"(?: [^>]+)?>/g,
        '',
      )
    : actualHtml;
}

/**
 * @param {import('@playwright/test').Page | import('@playwright/test').Frame} pageOrFrame
 */
async function assertHTMLOnPageOrFrame(
  pageOrFrame,
  expectedHtml,
  ignoreClasses,
  ignoreInlineStyles,
  frameName,
  browserName,
  actualHtmlModificationsCallback = (actualHtml) => actualHtml,
) {
  const expected = await prettifyHTML(expectedHtml.replace(/\n/gm, ''), {
    ignoreClasses,
    ignoreInlineStyles,
  });
  return await expect(async () => {
    const actualHtml = removeSafariLinebreakImgHack(
      await pageOrFrame
        .locator('div[contenteditable="true"]')
        .first()
        .innerHTML(),
      browserName,
    );
    let actual = await prettifyHTML(actualHtml.replace(/\n/gm, ''), {
      ignoreClasses,
      ignoreInlineStyles,
    });

    actual = await actualHtmlModificationsCallback(actual);

    expect(
      actual,
      `innerHTML of contenteditable in ${frameName} did not match`,
    ).toEqual(expected);
  }).toPass({intervals: [100, 250, 500], timeout: 5000});
}

/**
 * @function
 * @template T
 * @param {() => T | Promise<T>}
 * @returns {Promise<T>}
 */
export async function withExclusiveClipboardAccess(f) {
  const release = await lockfile.lock('.', {
    lockfilePath: '.playwright-clipboard.lock',
    retries: 5,
  });
  try {
    return f();
  } finally {
    await release();
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {boolean} isCollab
 */
export async function assertHTML(
  page,
  isCollab,
  browserName,
  expectedHtml,
  expectedHtmlFrameRight = expectedHtml,
  {ignoreClasses = false, ignoreInlineStyles = false} = {},
  actualHtmlModificationsCallback,
) {
  if (isCollab) {
    await Promise.all([
      assertHTMLOnPageOrFrame(
        page.frame('left'),
        expectedHtml,
        ignoreClasses,
        ignoreInlineStyles,
        'left frame',
        browserName,
        actualHtmlModificationsCallback,
      ),
      assertHTMLOnPageOrFrame(
        page.frame('right'),
        expectedHtmlFrameRight,
        ignoreClasses,
        ignoreInlineStyles,
        'right frame',
        browserName,
        actualHtmlModificationsCallback,
      ),
    ]);
  } else {
    await assertHTMLOnPageOrFrame(
      page,
      expectedHtml,
      ignoreClasses,
      ignoreInlineStyles,
      'page',
      browserName,
      actualHtmlModificationsCallback,
    );
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {boolean} isCollab
 * @param {boolean} tableHorizontalScroll
 */
export async function assertTableHTML(
  page,
  isCollab,
  browserName,
  tableHorizontalScroll,
  expectedHtml,
  expectedHtmlFrameRight = undefined,
  options = undefined,
  ...args
) {
  const wrappedExpected = tableHorizontalScroll
    ? wrapTableHtml(expectedHtml, options)
    : expectedHtml;
  const wrappedExpectedRight =
    tableHorizontalScroll && expectedHtmlFrameRight !== undefined
      ? wrapTableHtml(expectedHtmlFrameRight, options)
      : expectedHtmlFrameRight;

  return await assertHTML(
    page,
    isCollab,
    browserName,
    wrappedExpected,
    wrappedExpectedRight,
    options,
    ...args,
  );
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {boolean} isCollab
 * @returns {import('@playwright/test').Page | import('@playwright/test').Frame}
 */
export function getPageOrFrame(page, isCollab) {
  return isCollab ? page.frame('left') : page;
}

export async function assertTableSelectionCoordinates(
  page,
  isCollab,
  coordinates,
) {
  const pageOrFrame = getPageOrFrame(page, isCollab);

  const {_anchor, _focus} = await pageOrFrame.evaluate(() => {
    const editor = window.lexicalEditor;
    const editorState = editor.getEditorState();
    const selection = editorState._selection;
    if (!selection.tableKey) {
      throw new Error('Expected table selection');
    }
    const anchorElement = editor.getElementByKey(selection.anchor.key);
    const focusElement = editor.getElementByKey(selection.focus.key);
    return {
      _anchor: {
        x: anchorElement._cell?.x,
        y: anchorElement._cell?.y,
      },
      _focus: {
        x: focusElement._cell?.x,
        y: focusElement._cell?.y,
      },
    };
  });

  if (coordinates.anchor) {
    if (coordinates.anchor.x !== undefined) {
      expect(_anchor.x).toEqual(coordinates.anchor.x);
    }
    if (coordinates.anchor.y !== undefined) {
      expect(_anchor.y).toEqual(coordinates.anchor.y);
    }
  }
  if (coordinates.focus) {
    if (coordinates.focus.x !== undefined) {
      expect(_focus.x).toEqual(coordinates.focus.x);
    }
    if (coordinates.focus.y !== undefined) {
      expect(_focus.y).toEqual(coordinates.focus.y);
    }
  }
}

async function assertSelectionOnPageOrFrame(page, expected) {
  // Assert the selection of the editor matches the snapshot
  const selection = await page.evaluate(() => {
    const rootElement = document.querySelector('div[contenteditable="true"]');

    const getPathFromNode = (node) => {
      const path = [];
      if (node === rootElement) {
        return [];
      }
      while (node !== null) {
        const parent = node.parentNode;
        if (parent === null || node === rootElement) {
          break;
        }
        path.push(Array.from(parent.childNodes).indexOf(node));
        node = parent;
      }
      return path.reverse();
    };

    const fixOffset = (node, offset) => {
      // If the selection offset is at the br of a webkit img+br linebreak
      // then move the offset to the img so the tests are consistent across
      // browsers
      if (node && node.nodeType === Node.ELEMENT_NODE && offset > 0) {
        const child = node.children[offset - 1];
        if (
          child &&
          child.nodeType === Node.ELEMENT_NODE &&
          child.getAttribute('data-lexical-linebreak') === 'true'
        ) {
          return offset - 1;
        }
      }
      return offset;
    };

    const {anchorNode, anchorOffset, focusNode, focusOffset} =
      window.getSelection();

    return {
      anchorOffset: fixOffset(anchorNode, anchorOffset),
      anchorPath: getPathFromNode(anchorNode),
      focusOffset: fixOffset(focusNode, focusOffset),
      focusPath: getPathFromNode(focusNode),
    };
  });
  expect(selection.anchorPath).toEqual(expected.anchorPath);
  expect(selection.focusPath).toEqual(expected.focusPath);
  if (Array.isArray(expected.anchorOffset)) {
    const [start, end] = expected.anchorOffset;
    expect(selection.anchorOffset).toBeGreaterThanOrEqual(start);
    expect(selection.anchorOffset).toBeLessThanOrEqual(end);
  } else {
    expect(selection.anchorOffset).toEqual(expected.anchorOffset);
  }
  if (Array.isArray(expected.focusOffset)) {
    const [start, end] = expected.focusOffset;
    expect(selection.focusOffset).toBeGreaterThanOrEqual(start);
    expect(selection.focusOffset).toBeLessThanOrEqual(end);
  } else {
    expect(selection.focusOffset).toEqual(expected.focusOffset);
  }
}

export async function assertSelection(page, isCollab, expected) {
  await assertSelectionOnPageOrFrame(getPageOrFrame(page, isCollab), expected);
}

export async function isMac(page) {
  return page.evaluate(
    () =>
      typeof window !== 'undefined' &&
      /Mac|iPod|iPhone|iPad/.test(window.navigator.platform),
  );
}

export async function supportsBeforeInput(page) {
  return page.evaluate(() => {
    if ('InputEvent' in window) {
      return 'getTargetRanges' in new window.InputEvent('input');
    }
    return false;
  });
}

export async function keyDownCtrlOrMeta(page) {
  if (await isMac(page)) {
    await page.keyboard.down('Meta');
  } else {
    await page.keyboard.down('Control');
  }
}

export async function keyUpCtrlOrMeta(page) {
  if (await isMac(page)) {
    await page.keyboard.up('Meta');
  } else {
    await page.keyboard.up('Control');
  }
}

export async function keyDownCtrlOrAlt(page) {
  if (await isMac(page)) {
    await page.keyboard.down('Alt');
  } else {
    await page.keyboard.down('Control');
  }
}

export async function keyUpCtrlOrAlt(page) {
  if (await isMac(page)) {
    await page.keyboard.up('Alt');
  } else {
    await page.keyboard.up('Control');
  }
}

async function copyToClipboardPageOrFrame(pageOrFrame) {
  return await pageOrFrame.evaluate(() => {
    const clipboardData = {};
    const editor = document.querySelector('div[contenteditable="true"]');
    const copyEvent = new ClipboardEvent('copy');
    Object.defineProperty(copyEvent, 'clipboardData', {
      value: {
        setData(type, value) {
          clipboardData[type] = value;
        },
      },
    });
    editor.dispatchEvent(copyEvent);
    return clipboardData;
  });
}

export async function copyToClipboard(page, isCollab) {
  return await copyToClipboardPageOrFrame(getPageOrFrame(page, isCollab));
}

async function pasteWithClipboardDataFromPageOrFrame(
  pageOrFrame,
  clipboardData,
  editorSelector,
) {
  const canUseBeforeInput = await supportsBeforeInput(pageOrFrame);
  await pageOrFrame.evaluate(
    async ({
      clipboardData: _clipboardData,
      canUseBeforeInput: _canUseBeforeInput,
    }) => {
      const files = [];
      for (const [clipboardKey, clipboardValue] of Object.entries(
        _clipboardData,
      )) {
        if (clipboardKey.startsWith('playwright/base64')) {
          delete _clipboardData[clipboardKey];
          const [base64, type] = clipboardValue;
          const res = await fetch(base64);
          const blob = await res.blob();
          files.push(new File([blob], 'file', {type}));
        }
      }
      let eventClipboardData;
      if (files.length > 0) {
        eventClipboardData = {
          files,
          getData(type, value) {
            return _clipboardData[type];
          },
          types: [...Object.keys(_clipboardData), 'Files'],
        };
      } else {
        eventClipboardData = {
          files,
          getData(type, value) {
            return _clipboardData[type];
          },
          types: Object.keys(_clipboardData),
        };
      }

      const editor =
        document.activeElement && document.activeElement.isContentEditable
          ? document.activeElement
          : document.querySelector(editorSelector);
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: eventClipboardData,
      });
      editor.dispatchEvent(pasteEvent);
      if (!pasteEvent.defaultPrevented) {
        if (_canUseBeforeInput) {
          const inputEvent = new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
          });
          Object.defineProperty(inputEvent, 'inputType', {
            value: 'insertFromPaste',
          });
          Object.defineProperty(inputEvent, 'dataTransfer', {
            value: eventClipboardData,
          });
          editor.dispatchEvent(inputEvent);
        }
      }
    },
    {canUseBeforeInput, clipboardData},
  );
}

/**
 * @param {import('@playwright/test').Page} page
 */
export async function pasteFromClipboard(
  page,
  isCollab,
  clipboardData,
  editorSelector = 'div[contenteditable="true"]',
) {
  if (clipboardData === undefined) {
    await keyDownCtrlOrMeta(page);
    await page.keyboard.press('v');
    await keyUpCtrlOrMeta(page);
    return;
  }
  await pasteWithClipboardDataFromPageOrFrame(
    getPageOrFrame(page, isCollab),
    clipboardData,
    editorSelector,
  );
}

export async function sleep(delay) {
  await new Promise((resolve) => setTimeout(resolve, delay));
}

// Fair time for the browser to process a newly inserted image
export async function sleepInsertImage(count = 1) {
  return await sleep(1000 * count);
}

/**
 * @param {import('@playwright/test').Page} page
 */
export async function focusEditor(
  page,
  isCollab,
  parentSelector = '.editor-shell',
) {
  const locator = getEditorElement(page, isCollab, parentSelector);
  await locator.focus();
}

export async function getHTML(
  page,
  isCollab,
  selector = 'div[contenteditable="true"]',
) {
  return await locate(page, isCollab, selector).innerHTML();
}

export function getEditorElement(
  page,
  isCollab,
  parentSelector = '.editor-shell',
) {
  const selector = `${parentSelector} div[contenteditable="true"]`;
  return locate(page, isCollab, selector).first();
}

export async function waitForSelector(page, isCollab, selector, options) {
  await getPageOrFrame(page, isCollab).waitForSelector(selector, options);
}

export function locate(page, isCollab, selector) {
  return getPageOrFrame(page, isCollab).locator(selector);
}

export async function selectorBoundingBox(page, isCollab, selector) {
  return await locate(page, isCollab, selector).boundingBox();
}

export async function click(page, isCollab, selector, options) {
  const frame = getPageOrFrame(page, isCollab);
  await frame.waitForSelector(selector, options);
  await frame.click(selector, options);
}

export async function doubleClick(page, isCollab, selector, options) {
  const frame = getPageOrFrame(page, isCollab);
  await frame.waitForSelector(selector, options);
  await frame.dblclick(selector, options);
}

export async function focus(page, isCollab, selector, options) {
  await locate(page, isCollab, selector).focus(options);
}

export async function fill(page, isCollab, selector, value) {
  await locate(page, isCollab, selector).fill(value);
}

export async function selectOption(page, isCollab, selector, options) {
  await getPageOrFrame(page, isCollab).selectOption(selector, options);
}

export async function textContent(page, isCollab, selector, options) {
  return await getPageOrFrame(page, isCollab).textContent(selector, options);
}

export async function evaluate(page, isCollab, fn, args) {
  return await getPageOrFrame(page, isCollab).evaluate(fn, args);
}

export async function clearEditor(page, isCollab, browserName) {
  await selectAll(page, isCollab, browserName);
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
}

export async function insertSampleImage(page, isCollab, modifier) {
  await selectFromInsertDropdown(page, isCollab, '.image');
  if (modifier === 'alt') {
    await page.keyboard.down('Alt');
  }
  await click(
    page,
    isCollab,
    'button[data-test-id="image-modal-option-sample"]',
  );
  if (modifier === 'alt') {
    await page.keyboard.up('Alt');
  }
}

export async function insertUrlImage(page, isCollab, url, altText) {
  await selectFromInsertDropdown(page, isCollab, '.image');
  await click(page, isCollab, 'button[data-test-id="image-modal-option-url"]');
  await focus(page, isCollab, 'input[data-test-id="image-modal-url-input"]');
  await page.keyboard.type(url);
  if (altText) {
    await focus(
      page,
      isCollab,
      'input[data-test-id="image-modal-alt-text-input"]',
    );
    await page.keyboard.type(altText);
  }
  await click(page, isCollab, 'button[data-test-id="image-modal-confirm-btn"]');
}

export async function insertUploadImage(page, isCollab, files, altText) {
  await selectFromInsertDropdown(page, isCollab, '.image');
  await click(page, isCollab, 'button[data-test-id="image-modal-option-file"]');

  const frame = getPageOrFrame(page, isCollab);
  await frame.setInputFiles(
    'input[data-test-id="image-modal-file-upload"]',
    files,
  );

  if (altText) {
    await focus(
      page,
      isCollab,
      'input[data-test-id="image-modal-alt-text-input"]',
    );
    await page.keyboard.type(altText);
  }
  await click(
    page,
    isCollab,
    'button[data-test-id="image-modal-file-upload-btn"]',
  );
}

export async function insertHorizontalRule(page, isCollab) {
  await selectFromInsertDropdown(page, isCollab, '.horizontal-rule');
}

export async function insertImageCaption(page, isCollab, caption) {
  await click(page, isCollab, '.editor-image img');
  await click(page, isCollab, '.image-caption-button');
  await waitForSelector(page, isCollab, '.editor-image img.focused', {
    state: 'detached',
  });
  await focusEditor(page, isCollab, '.image-caption-container');
  await page.keyboard.type(caption);
}

export async function mouseMoveToSelector(page, isCollab, selector) {
  const {x, width, y, height} = await selectorBoundingBox(
    page,
    isCollab,
    selector,
  );
  await page.mouse.move(x + width / 2, y + height / 2);
}

export async function dragMouse(
  page,
  fromBoundingBox,
  toBoundingBox,
  opts = {},
) {
  const {
    positionStart = 'middle',
    positionEnd = 'middle',
    mouseDown = true,
    mouseUp = true,
    slow = false,
  } = opts;
  let fromX = fromBoundingBox.x;
  let fromY = fromBoundingBox.y;
  if (positionStart === 'middle') {
    fromX += fromBoundingBox.width / 2;
    fromY += fromBoundingBox.height / 2;
  } else if (positionStart === 'end') {
    fromX += fromBoundingBox.width;
    fromY += fromBoundingBox.height;
  }
  let toX = toBoundingBox.x;
  let toY = toBoundingBox.y;
  if (positionEnd === 'middle') {
    toX += toBoundingBox.width / 2;
    toY += toBoundingBox.height / 2;
  } else if (positionEnd === 'end') {
    toX += toBoundingBox.width;
    toY += toBoundingBox.height;
  }

  await page.mouse.move(fromX, fromY);
  if (mouseDown) {
    await page.mouse.down();
  }
  await page.mouse.move(toX, toY, slow ? 10 : 1);
  if (mouseUp) {
    await page.mouse.up();
  }
}

export async function dragImage(
  page,
  isCollab,
  toSelector,
  positionStart = 'middle',
  positionEnd = 'middle',
) {
  await dragMouse(
    page,
    await selectorBoundingBox(page, isCollab, '.editor-image img'),
    await selectorBoundingBox(page, isCollab, toSelector),
    {positionEnd, positionStart},
  );
}

export async function prettifyHTML(
  string,
  {ignoreClasses, ignoreInlineStyles} = {},
) {
  let output = string;

  if (ignoreClasses) {
    output = output.replace(/\sclass="([^"]*)"/g, '');
  }

  if (ignoreInlineStyles) {
    output = output.replace(/\sstyle="([^"]*)"/g, '');
  }

  output = output.replace(/\s__playwright_target__="[^"]+"/, '');

  return await prettier.format(output, {
    attributeGroups: ['$DEFAULT', '^data-'],
    attributeSort: 'asc',
    bracketSameLine: true,
    htmlWhitespaceSensitivity: 'ignore',
    parser: 'html',
    plugins: ['prettier-plugin-organize-attributes'],
  });
}

// This function does not suppose to do anything, it's only used as a trigger
// for prettier auto-formatting (https://prettier.io/blog/2020/08/24/2.1.0.html#api)
export function html(partials, ...params) {
  let output = '';
  for (let i = 0; i < partials.length; i++) {
    output += partials[i];
    if (i < partials.length - 1) {
      output += params[i];
    }
  }
  return output;
}

export async function selectFromAdditionalStylesDropdown(
  page,
  isCollab,
  selector,
) {
  await click(
    page,
    isCollab,
    '.toolbar-item[aria-label="Formatting options for additional text styles"]',
  );
  await click(page, isCollab, '.dropdown ' + selector);
}

export async function selectFromBackgroundColorPicker(page, isCollab) {
  await click(
    page,
    isCollab,
    '.toolbar-item[aria-label="Formatting background color"]',
  );
  await click(page, isCollab, '.color-picker-basic-color button:first-child'); //Defaulted to red
}

export async function selectFromColorPicker(page, isCollab) {
  await click(
    page,
    isCollab,
    '.toolbar-item[aria-label="Formatting text color"]',
  );
  await click(page, isCollab, '.color-picker-basic-color button:first-child'); //Defaulted to red
}
export async function selectFromFormatDropdown(page, isCollab, selector) {
  await click(
    page,
    isCollab,
    '.toolbar-item[aria-label="Formatting options for text style"]',
  );
  await click(page, isCollab, '.dropdown ' + selector);
}

export async function selectFromInsertDropdown(page, isCollab, selector) {
  await click(
    page,
    isCollab,
    '.toolbar-item[aria-label="Insert specialized editor node"]',
  );
  await click(page, isCollab, '.dropdown ' + selector);
}

export async function selectFromAlignDropdown(page, isCollab, selector) {
  await click(
    page,
    isCollab,
    '.toolbar-item[aria-label="Formatting options for text alignment"]',
  );
  await click(page, isCollab, '.dropdown ' + selector);
}

export async function selectFromTableDropdown(page, isCollab, selector) {
  await click(page, isCollab, '.toolbar-item[aria-label="Open table toolkit"]');
  await click(page, isCollab, '.dropdown ' + selector);
}

export async function insertTable(page, isCollab, rows = 2, columns = 3) {
  const leftFrame = getPageOrFrame(page, isCollab);
  await selectFromInsertDropdown(page, isCollab, '.item .table');
  if (rows !== null) {
    await leftFrame
      .locator('input[data-test-id="table-modal-rows"]')
      .fill(String(rows));
  }
  if (columns !== null) {
    await leftFrame
      .locator('input[data-test-id="table-modal-columns"]')
      .fill(String(columns));
  }
  await click(
    page,
    isCollab,
    'div[data-test-id="table-model-confirm-insert"] > .Button__root',
  );
}

export async function selectCellFromTableCoord(
  page,
  isCollab,
  coord,
  isHeader = false,
) {
  const leftFrame = getPageOrFrame(page, isCollab);
  if (isCollab) {
    await focusEditor(page, isCollab);
  }

  const cell = await leftFrame.locator(
    `table:first-of-type > :nth-match(tr, ${coord.y + 1}) > ${
      isHeader ? 'th' : 'td'
    }:nth-child(${coord.x + 1})`,
  );
  await cell.click();
}

export async function selectCellsFromTableCords(
  page,
  isCollab,
  firstCords,
  secondCords,
  isFirstHeader = false,
  isSecondHeader = false,
) {
  const leftFrame = getPageOrFrame(page, isCollab);
  if (isCollab) {
    await focusEditor(page, isCollab);
  }

  const firstRowFirstColumnCell = await leftFrame.locator(
    `table:first-of-type > :nth-match(tr, ${firstCords.y + 1}) > ${
      isFirstHeader ? 'th' : 'td'
    }:nth-child(${firstCords.x + 1})`,
  );
  const secondRowSecondCell = await leftFrame.locator(
    `table:first-of-type > :nth-match(tr, ${secondCords.y + 1}) > ${
      isSecondHeader ? 'th' : 'td'
    }:nth-child(${secondCords.x + 1})`,
  );

  await firstRowFirstColumnCell.click();
  await page.keyboard.down('Shift');
  await secondRowSecondCell.click();
  await page.keyboard.up('Shift');

  // const firstBox = await firstRowFirstColumnCell.boundingBox();
  // const secondBox = await secondRowSecondCell.boundingBox();
  // await dragMouse(page, firstBox, secondBox, {slow: true});
}

export async function clickTableCellActiveButton(page, isCollab) {
  await click(
    page,
    isCollab,
    '.table-cell-action-button-container--active > .table-cell-action-button',
  );
}

export async function insertTableRowAbove(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-insert-row-above"]');
}

export async function insertTableRowBelow(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-insert-row-below"]');
}

export async function insertTableColumnBefore(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(
    page,
    isCollab,
    '.item[data-test-id="table-insert-column-before"]',
  );
}

export async function insertTableColumnAfter(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(
    page,
    isCollab,
    '.item[data-test-id="table-insert-column-after"]',
  );
}

export async function mergeTableCells(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-merge-cells"]');
}

export async function unmergeTableCell(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-unmerge-cells"]');
}

export async function toggleColumnHeader(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-column-header"]');
}

export async function toggleRowHeader(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-row-header"]');
}

export async function deleteTableRows(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-delete-rows"]');
}

export async function deleteTableColumns(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-delete-columns"]');
}

export async function deleteTable(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-delete"]');
}

export async function setBackgroundColor(page, isCollab) {
  await clickTableCellActiveButton(page, isCollab);
  await click(page, isCollab, '.item[data-test-id="table-background-color"]');
}

export async function enableCompositionKeyEvents(page, isCollab) {
  const targetPage = getPageOrFrame(page, isCollab);
  await targetPage.evaluate(() => {
    window.addEventListener(
      'compositionstart',
      () => {
        document.activeElement.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'Unidentified',
            keyCode: 220,
          }),
        );
      },
      true,
    );
  });
}

export async function pressToggleBold(page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('b');
  await keyUpCtrlOrMeta(page);
}

export async function pressToggleItalic(page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('i');
  await keyUpCtrlOrMeta(page);
}

export async function pressToggleUnderline(page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('u');
  await keyUpCtrlOrMeta(page);
}

export async function dragDraggableMenuTo(
  page,
  isCollab,
  toSelector,
  positionStart = 'middle',
  positionEnd = 'middle',
) {
  await dragMouse(
    page,
    await selectorBoundingBox(page, isCollab, '.draggable-block-menu'),
    await selectorBoundingBox(page, isCollab, toSelector),
    {positionEnd, positionStart},
  );
}

export async function pressInsertLinkButton(page, isCollab) {
  await click(page, isCollab, '.toolbar-item[aria-label="Insert link"]');
}

/**
 * Creates a selection object to assert against that is human readable and self-describing.
 *
 * Selections are composed of an anchorPath (the start) and a focusPath (the end).
 * Once you traverse each path, you use the respective offsets to find the exact location of the cursor.
 * So offsets are relative to their path. For example, if the anchorPath is [0, 1, 2] and the anchorOffset is 3,
 * then the cursor is at the 4th character of the 3rd element of the 2nd element of the 1st element.
 *
 * @example
 * const expectedSelection = createHumanReadableSelection('the full text of the last cell', {
 *   anchorOffset: {desc: 'beginning of cell', value: 0},
 *   anchorPath: [
 *     {desc: 'index of table in root', value: 1},
 *     {desc: 'first table row', value: 0},
 *     {desc: 'first cell', value: 0},
 *   ],
 *   focusOffset: {desc: 'full text length', value: 9},
 *   focusPath: [
 *     {desc: 'index of last paragraph', value: 2},
 *     {desc: 'index of first span', value: 0},
 *     {desc: 'index of text block', value: 0},
 *   ],
 * });
 */
export function createHumanReadableSelection(_overview, dto) {
  return {
    anchorOffset: dto.anchorOffset.value,
    anchorPath: dto.anchorPath.map((p) => p.value),
    focusOffset: dto.focusOffset.value,
    focusPath: dto.focusPath.map((p) => p.value),
  };
}
