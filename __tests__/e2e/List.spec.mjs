/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  indent,
  moveLeft,
  moveRight,
  moveToEditorBeginning,
  moveToEditorEnd,
  moveToLineBeginning,
  moveToParagraphEnd,
  pressBackspace,
  redo,
  selectAll,
  selectCharacters,
  toggleBold,
  undo,
} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  assertSelection,
  clearEditor,
  click,
  copyToClipboard,
  focusEditor,
  html,
  initialize,
  insertSampleImage,
  pasteFromClipboard,
  sampleFlowerImageUrl,
  selectFromAlignDropdown,
  selectFromColorPicker,
  selectFromFormatDropdown,
  test,
  waitForSelector,
  withExclusiveClipboardAccess,
} from '../utils/index.mjs';

async function toggleBulletList(page, isCollab) {
  await click(page, isCollab, '.block-controls');
  await click(page, isCollab, '.dropdown .icon.bullet-list');
}

async function toggleNumberedList(page, isCollab) {
  await click(page, isCollab, '.block-controls');
  await click(page, isCollab, '.dropdown .icon.numbered-list');
}

async function clickIndentButton(page, isCollab, times = 1) {
  for (let i = 0; i < times; i++) {
    await selectFromAlignDropdown(page, isCollab, '.indent');
  }
}

async function clickOutdentButton(page, isCollab, times = 1) {
  for (let i = 0; i < times; i++) {
    await selectFromAlignDropdown(page, isCollab, '.outdent');
  }
}

test.beforeEach(
  ({environment, browserName, tableHorizontalScroll, isPlainText}) => {
    test.skip(isPlainText);
  },
);

test.describe.parallel('Nested List', () => {
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
    `Can create a list and partially copy some content out of it`,
    {tag: '@flaky'},
    async ({page, isCollab, browserName}) => {
      await focusEditor(page, isCollab);
      await page.keyboard.type(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam venenatis risus ac cursus efficitur. Cras efficitur magna odio, lacinia posuere mauris placerat in. Etiam eu congue nisl. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nulla vulputate justo id eros convallis, vel pellentesque orci hendrerit. Pellentesque accumsan molestie eros, vitae tempor nisl semper sit amet. Sed vulputate leo dolor, et bibendum quam feugiat eget. Praesent vestibulum libero sed enim ornare, in consequat dui posuere. Maecenas ornare vestibulum felis, non elementum urna imperdiet sit amet.',
      );
      await toggleBulletList(page, isCollab);
      await moveToEditorBeginning(page);
      await moveRight(page, 6);
      await selectCharacters(page, 'right', 11);

      await withExclusiveClipboardAccess(async () => {
        const clipboard = await copyToClipboard(page, isCollab);

        await moveToEditorEnd(page, browserName);
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');

        await pasteFromClipboard(page, isCollab, clipboard);
      });

      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <ul class="PlaygroundEditorTheme__ul" dir="auto">
            <li class="PlaygroundEditorTheme__listItem" value="1">
              <span data-lexical-text="true">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
                venenatis risus ac cursus efficitur. Cras efficitur magna odio,
                lacinia posuere mauris placerat in. Etiam eu congue nisl.
                Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
                posuere cubilia curae; Nulla vulputate justo id eros convallis,
                vel pellentesque orci hendrerit. Pellentesque accumsan molestie
                eros, vitae tempor nisl semper sit amet. Sed vulputate leo
                dolor, et bibendum quam feugiat eget. Praesent vestibulum libero
                sed enim ornare, in consequat dui posuere. Maecenas ornare
                vestibulum felis, non elementum urna imperdiet sit amet.
              </span>
            </li>
          </ul>
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">ipsum dolor</span>
          </p>
        `,
      );
    },
  );

  test('Should outdent if indented when the backspace key is pressed', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');

    await clickIndentButton(page, isCollab, 3);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="1">
                <ul class="PlaygroundEditorTheme__ul">
                  <li
                    class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                    value="1">
                    <ul class="PlaygroundEditorTheme__ul">
                      <li class="PlaygroundEditorTheme__listItem" value="1">
                        <br />
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="1">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <br />
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1"><br /></li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('Should outdent if indented when the backspace key is pressed only at the front', async ({
    page,
    isCollab,
    browserName,
    environment,
  }) => {
    // repro for #7514
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);

    await insertSampleImage(page, isCollab);
    await page.keyboard.type('x');
    await moveLeft(page, 1);

    await clickIndentButton(page, isCollab, 1);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span
                  class="editor-image"
                  contenteditable="false"
                  data-lexical-decorator="true">
                  <div draggable="false">
                    <img
                      alt="Yellow flower in tilt shift lens"
                      draggable="false"
                      src="${sampleFlowerImageUrl(environment)}"
                      style="height: inherit; max-width: 500px; width: inherit" />
                  </div>
                </span>
                <span data-lexical-text="true">x</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await page.keyboard.press('Backspace');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">x</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );
  });

  test('Should retain selection style when exiting list', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);

    await selectFromColorPicker(page, isCollab);
    await toggleBold(page);
    await page.keyboard.type('Item one');
    await page.keyboard.press('Enter');
    await clickIndentButton(page, isCollab);
    await page.keyboard.type('Nested item two');
    // Double-enter to exit nested list
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Item three');
    // Double-enter to exit list
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Normal text');

    // This color is normalized by the browser
    const expectedTextStyle = 'color: rgb(208, 2, 27);';
    // This isn't (yet) parsed as a color, so it isn't normalized
    const expectedMarkerStyle = '--listitem-marker-color: #d0021b;';
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem"
            style="${expectedMarkerStyle}"
            value="1">
            <strong
              class="PlaygroundEditorTheme__textBold"
              style="${expectedTextStyle}"
              data-lexical-text="true">
              Item one
            </strong>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            style="${expectedMarkerStyle}"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li
                class="PlaygroundEditorTheme__listItem"
                style="${expectedMarkerStyle}"
                value="1">
                <strong
                  class="PlaygroundEditorTheme__textBold"
                  style="${expectedTextStyle}"
                  data-lexical-text="true">
                  Nested item two
                </strong>
              </li>
            </ul>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem"
            style="${expectedMarkerStyle}"
            value="2">
            <strong
              class="PlaygroundEditorTheme__textBold"
              style="${expectedTextStyle}"
              data-lexical-text="true">
              Item three
            </strong>
          </li>
        </ul>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <strong
            class="PlaygroundEditorTheme__textBold"
            style="${expectedTextStyle}"
            data-lexical-text="true">
            Normal text
          </strong>
        </p>
      `,
    );
  });

  test(`Can indent/outdent multiple list nodes in a list with multiple levels of indentation`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1"><br /></li>
        </ul>
      `,
    );

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');

    await clickIndentButton(page, isCollab);

    // - Hello
    //    - from
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await clickIndentButton(page, isCollab, 3);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="1">
                <ul class="PlaygroundEditorTheme__ul">
                  <li
                    class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                    value="1">
                    <ul class="PlaygroundEditorTheme__ul">
                      <li class="PlaygroundEditorTheme__listItem" value="1">
                        <span data-lexical-text="true">Hello</span>
                      </li>
                      <li
                        class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                        value="2">
                        <ul class="PlaygroundEditorTheme__ul">
                          <li class="PlaygroundEditorTheme__listItem" value="1">
                            <span data-lexical-text="true">from</span>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await clickOutdentButton(page, isCollab, 3);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await page.keyboard.press('ArrowRight');

    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await page.keyboard.press('Enter');
    await page.keyboard.type('side');

    await clickOutdentButton(page, isCollab);

    // - Hello
    //    - from
    //    - the
    //    - other
    // - side
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">the</span>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="3">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await clickIndentButton(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">Hello</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">from</span>
                  </li>
                  <li class="PlaygroundEditorTheme__listItem" value="2">
                    <span data-lexical-text="true">the</span>
                  </li>
                  <li class="PlaygroundEditorTheme__listItem" value="3">
                    <span data-lexical-text="true">other</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">side</span>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await clickOutdentButton(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">the</span>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="3">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Can indent a list with a list item in between nested lists`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('foo');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('bar');
    await clickOutdentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('baz');
    await clickIndentButton(page, isCollab);

    await selectAll(page, isCollab, browserName);
    await clickIndentButton(page, isCollab);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul dir="auto">
          <li value="1">
            <ul>
              <li value="1">
                <ul>
                  <li value="1">
                    <span data-lexical-text="true">foo</span>
                  </li>
                </ul>
              </li>
              <li value="1">
                <span data-lexical-text="true">bar</span>
              </li>
              <li value="2">
                <ul>
                  <li value="1">
                    <span data-lexical-text="true">baz</span>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
      undefined,
      {ignoreClasses: true},
    );
  });

  test(`Can create a list and then toggle it back to original state.`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await page.keyboard.type('Hello');

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
        </ul>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello</span>
        </p>
      `,
    );

    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await page.keyboard.press('Enter');
    await page.keyboard.type('side');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">from</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">the</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">other</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">side</span>
        </p>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">from</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">the</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">other</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">side</span>
        </p>
      `,
    );

    // works for an indented list

    await toggleBulletList(page, isCollab);

    await clickIndentButton(page, isCollab, 3);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="1">
            <ul class="PlaygroundEditorTheme__ul">
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="1">
                <ul class="PlaygroundEditorTheme__ul">
                  <li
                    class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                    value="1">
                    <ul class="PlaygroundEditorTheme__ul">
                      <li class="PlaygroundEditorTheme__listItem" value="1">
                        <span data-lexical-text="true">Hello</span>
                      </li>
                      <li class="PlaygroundEditorTheme__listItem" value="2">
                        <span data-lexical-text="true">from</span>
                      </li>
                      <li class="PlaygroundEditorTheme__listItem" value="3">
                        <span data-lexical-text="true">the</span>
                      </li>
                      <li class="PlaygroundEditorTheme__listItem" value="4">
                        <span data-lexical-text="true">other</span>
                      </li>
                      <li class="PlaygroundEditorTheme__listItem" value="5">
                        <span data-lexical-text="true">side</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(120px)">
          <span data-lexical-text="true">Hello</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(120px)">
          <span data-lexical-text="true">from</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(120px)">
          <span data-lexical-text="true">the</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(120px)">
          <span data-lexical-text="true">other</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(120px)">
          <span data-lexical-text="true">side</span>
        </p>
      `,
    );
  });

  test(`Can toggle format for multi-line list of each type without losing indentation state.`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    // Standard assertion
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await clickOutdentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('side');
    await clickOutdentButton(page, isCollab);

    // Before toggle off/on unordered list
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await toggleBulletList(page, isCollab);
    await toggleBulletList(page, isCollab);

    // After toggle off/on unordered list
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await toggleNumberedList(page, isCollab);

    // Before toggle off/on ordered list
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ol class="PlaygroundEditorTheme__ol2">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ol class="PlaygroundEditorTheme__ol3">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ol>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ol>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ol>
      `,
    );

    await toggleNumberedList(page, isCollab);
    await toggleNumberedList(page, isCollab);

    // After toggle off/on ordered list
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ol class="PlaygroundEditorTheme__ol2">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ol class="PlaygroundEditorTheme__ol3">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ol>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ol>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ol>
      `,
    );
  });

  test(`Can create a list containing inline blocks and then toggle it back to original state.`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await page.keyboard.type('One two three');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">One two three</span>
        </p>
      `,
    );

    await moveLeft(page, 6);
    await selectCharacters(page, 'left', 3);

    // link
    await click(page, isCollab, '.link');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">One</span>
          <a
            class="PlaygroundEditorTheme__link"
            href="https://"
            rel="noreferrer">
            <span data-lexical-text="true">two</span>
          </a>
          <span data-lexical-text="true">three</span>
        </p>
      `,
    );

    // move to end of paragraph to close the floating link bar
    await moveToParagraphEnd(page);

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">One</span>
            <a
              class="PlaygroundEditorTheme__link"
              href="https://"
              rel="noreferrer">
              <span data-lexical-text="true">two</span>
            </a>
            <span data-lexical-text="true">three</span>
          </li>
        </ul>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">One</span>
          <a
            class="PlaygroundEditorTheme__link"
            href="https://"
            rel="noreferrer">
            <span data-lexical-text="true">two</span>
          </a>
          <span data-lexical-text="true">three</span>
        </p>
      `,
    );
  });

  test(`Can create multiple bullet lists and then toggle off the list.`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );

    await page.keyboard.type('Hello');

    await toggleBulletList(page, isCollab);

    await page.keyboard.press('Enter');
    await page.keyboard.type('from');

    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('the');

    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.type('other');

    await toggleBulletList(page, isCollab);

    await page.keyboard.press('Enter');
    await page.keyboard.type('side');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
        </ul>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">the</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">from</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">the</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">other</span>
        </p>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">side</span>
        </p>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3"><br /></li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5"><br /></li>
          <li class="PlaygroundEditorTheme__listItem" value="6">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="7">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Can create an unordered list and convert it to an ordered list `, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await waitForSelector(page, isCollab, '.block-controls');

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1"><br /></li>
        </ul>
      `,
    );

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1"><br /></li>
        </ol>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1"><br /></li>
        </ul>
      `,
    );
  });

  test(`Can create a single item unordered list with text and convert it to an ordered list `, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
        </ol>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Can create a multi-line unordered list and convert it to an ordered list `, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await page.keyboard.press('Enter');
    await page.keyboard.type('side');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5">
            <span data-lexical-text="true">side</span>
          </li>
        </ol>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Can create a multi-line unordered list and convert it to an ordered list when no nodes are in the selection`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await page.keyboard.press('Enter');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5"><br /></li>
        </ul>
      `,
    );

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5"><br /></li>
        </ol>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5"><br /></li>
        </ul>
      `,
    );
  });

  test(`Can create an indented multi-line unordered list and convert it to an ordered list `, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await clickOutdentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('side');
    await clickOutdentButton(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ol class="PlaygroundEditorTheme__ol2">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ol class="PlaygroundEditorTheme__ol3">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ol>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ol>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ol>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Can create an indented multi-line unordered list and convert individual lists in the nested structure to a numbered list. `, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);

    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await clickOutdentButton(page, isCollab);

    await page.keyboard.press('Enter');
    await page.keyboard.type('side');
    await clickOutdentButton(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ol>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    // move to next item up in list
    await page.keyboard.press('ArrowUp');

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ol class="PlaygroundEditorTheme__ol2">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ol>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    // move to next item up in list
    await page.keyboard.press('ArrowUp');

    await toggleNumberedList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ol class="PlaygroundEditorTheme__ol3">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ol>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <span data-lexical-text="true">from</span>
              </li>
              <li
                class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
                value="2">
                <ul class="PlaygroundEditorTheme__ul">
                  <li class="PlaygroundEditorTheme__listItem" value="1">
                    <span data-lexical-text="true">the</span>
                  </li>
                </ul>
              </li>
              <li class="PlaygroundEditorTheme__listItem" value="2">
                <span data-lexical-text="true">other</span>
              </li>
            </ul>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Should merge selected nodes into existing list siblings of the same type when formatting to a list`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    // Hello
    // - from
    // the
    // - other
    // side
    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await toggleBulletList(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await page.keyboard.press('Enter');
    await page.keyboard.type('other');
    await toggleBulletList(page, isCollab);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('side');

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello</span>
        </p>
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">from</span>
          </li>
        </ul>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">the</span>
        </p>
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">other</span>
          </li>
        </ul>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">side</span>
        </p>
      `,
    );

    await selectAll(page, isCollab, browserName);

    await toggleBulletList(page, isCollab);

    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="4">
            <span data-lexical-text="true">other</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="5">
            <span data-lexical-text="true">side</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Should NOT merge selected nodes into existing list siblings of a different type when formatting to a list`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    // - Hello
    // - from
    // the
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('from');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await toggleNumberedList(page, isCollab);

    // - Hello
    // - from
    // 1. the
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
        </ul>
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">the</span>
          </li>
        </ol>
      `,
    );

    await clearEditor(page, isCollab, browserName);

    // Hello
    // 1. from
    // 2. the
    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await toggleNumberedList(page, isCollab);
    await page.keyboard.type('from');
    await page.keyboard.press('Enter');
    await page.keyboard.type('the');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await toggleNumberedList(page, isCollab);

    // 1. Hello
    // 2. from
    // 3. the
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ol class="PlaygroundEditorTheme__ol1" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="3">
            <span data-lexical-text="true">the</span>
          </li>
        </ol>
      `,
    );
  });

  test(`Should create list with start number markdown`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    // Trigger markdown using 321 digits followed by "." and a trigger of " ".
    await page.keyboard.type('321. ');

    // forward case is the normal case.
    // undo case is when the user presses undo.

    const forwardHTML =
      '<ol start="321" class="PlaygroundEditorTheme__ol1" dir="auto"><li value="321" class="PlaygroundEditorTheme__listItem"><br></li></ol>';

    const undoHTML = html`
      <p class="PlaygroundEditorTheme__paragraph" dir="auto">
        <span data-lexical-text="true">321.</span>
      </p>
    `;

    await assertHTML(page, isCollab, browserName, forwardHTML);
    if (isCollab) {
      // Collab uses its own undo/redo
      return;
    }
    await undo(page);
    await assertHTML(page, isCollab, browserName, undoHTML);
    await redo(page);
    await assertHTML(page, isCollab, browserName, forwardHTML);
  });

  test(`Should not process paragraph markdown inside list.`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);

    await toggleBulletList(page, isCollab);
    await page.keyboard.type('# ');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">#</span>
          </li>
        </ul>
      `,
    );
  });

  test(`Un-indents list empty list items when the user presses enter`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('a');
    await page.keyboard.press('Enter');
    await clickIndentButton(page, isCollab);
    await clickIndentButton(page, isCollab);
    await page.keyboard.press('Enter');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">a</span>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1"><br /></li>
            </ul>
          </li>
        </ul>
      `,
    );
    await page.keyboard.press('Enter');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">a</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2"><br /></li>
        </ul>
      `,
    );
    await page.keyboard.press('Enter');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">a</span>
          </li>
        </ul>
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
  });

  test(`Converts a List with one ListItem to a Paragraph when Normal is selected in the format menu`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('a');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
          </li>
        </ul>
      `,
      undefined,
      {ignoreClasses: true},
    );
    await selectFromFormatDropdown(page, isCollab, '.paragraph');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p dir="auto"><span data-lexical-text="true">a</span></p>
      `,
      undefined,
      {ignoreClasses: true},
    );
  });

  test(`Converts the last ListItem in a List with multiple ListItem to a Paragraph when Normal is selected in the format menu`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('a');
    await page.keyboard.press('Enter');
    await page.keyboard.type('b');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
          </li>
          <li value="2">
            <span data-lexical-text="true">b</span>
          </li>
        </ul>
      `,
      undefined,
      {ignoreClasses: true},
    );
    await selectFromFormatDropdown(page, isCollab, '.paragraph');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
          </li>
        </ul>
        <p dir="auto"><span data-lexical-text="true">b</span></p>
      `,
      undefined,
      {ignoreClasses: true},
    );
  });

  test(`Converts the middle ListItem in a List with multiple ListItem to a Paragraph when Normal is selected in the format menu`, async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('a');
    await page.keyboard.press('Enter');
    await page.keyboard.type('b');
    await page.keyboard.press('Enter');
    await page.keyboard.type('c');
    await page.keyboard.press('ArrowUp');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
          </li>
          <li value="2">
            <span data-lexical-text="true">b</span>
          </li>
          <li value="3">
            <span data-lexical-text="true">c</span>
          </li>
        </ul>
      `,
      undefined,
      {ignoreClasses: true},
    );
    await selectFromFormatDropdown(page, isCollab, '.paragraph');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">a</span>
          </li>
        </ul>
        <p dir="auto"><span data-lexical-text="true">b</span></p>
        <ul dir="auto">
          <li value="1">
            <span data-lexical-text="true">c</span>
          </li>
        </ul>
      `,
      undefined,
      {ignoreClasses: true},
    );
  });

  test('replaces existing element node', async ({
    page,
    isCollab,
    browserName,
  }) => {
    // Create two quote blocks, select it and format to a list
    // should replace quotes (instead of moving quotes into the list items)
    await focusEditor(page, isCollab);
    await page.keyboard.type('> Hello from');
    await page.keyboard.press('Enter');
    await page.keyboard.type('> the other side');
    await selectAll(page, isCollab, browserName);
    await toggleBulletList(page, isCollab);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello from</span>
          </li>
          <li class="PlaygroundEditorTheme__listItem" value="2">
            <span data-lexical-text="true">the other side</span>
          </li>
        </ul>
      `,
    );
  });

  test('remove list breaks when selection in empty nested list item', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await page.keyboard.type('Hello World');
    await page.keyboard.press('Enter');
    await toggleBulletList(page, isCollab);
    await click(page, isCollab, '.toolbar-item.alignment');
    await click(page, isCollab, 'button:has-text("Indent")');
    await toggleBulletList(page, isCollab);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello World</span>
        </p>
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
          dir="auto"
          style="padding-inline-start: calc(40px)">
          <br />
        </p>
      `,
    );
    await assertSelection(page, isCollab, {
      anchorOffset: 0,
      anchorPath: [1],
      focusOffset: 0,
      focusPath: [1],
    });
  });

  test(
    'remove list breaks when selection in empty nested list item 2',
    {tag: '@flaky'},
    async ({page, isCollab, browserName}) => {
      await focusEditor(page, isCollab);
      await page.keyboard.type('Hello World');
      await page.keyboard.press('Enter');
      await page.keyboard.type('a');
      await toggleBulletList(page, isCollab);
      await page.keyboard.press('Enter');
      await page.keyboard.type('b');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('Enter');
      await click(page, isCollab, '.toolbar-item.alignment');
      await click(page, isCollab, 'button:has-text("Indent")');
      await toggleBulletList(page, isCollab);
      await assertHTML(
        page,
        isCollab,
        browserName,
        html`
          <p class="PlaygroundEditorTheme__paragraph" dir="auto">
            <span data-lexical-text="true">Hello World</span>
          </p>
          <ul class="PlaygroundEditorTheme__ul" dir="auto">
            <li class="PlaygroundEditorTheme__listItem" value="1">
              <span data-lexical-text="true">a</span>
            </li>
          </ul>
          <p
            class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__indent"
            dir="auto"
            style="padding-inline-start: calc(40px)">
            <br />
          </p>
          <ul class="PlaygroundEditorTheme__ul" dir="auto">
            <li class="PlaygroundEditorTheme__listItem" value="1">
              <span data-lexical-text="true">b</span>
            </li>
          </ul>
        `,
      );
      await assertSelection(page, isCollab, {
        anchorOffset: 0,
        anchorPath: [2],
        focusOffset: 0,
        focusPath: [2],
      });
    },
  );
  test('new list item should preserve format from previous list item even after new list item is indented', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await toggleBold(page);
    await page.keyboard.type('MLH Fellowship');
    await page.keyboard.press('Enter');
    await indent(page, 1);
    await page.keyboard.type('Fall 2024');
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <strong
              class="PlaygroundEditorTheme__textBold"
              data-lexical-text="true">
              MLH Fellowship
            </strong>
          </li>
          <li
            class="PlaygroundEditorTheme__listItem PlaygroundEditorTheme__nestedListItem"
            value="2">
            <ul class="PlaygroundEditorTheme__ul">
              <li class="PlaygroundEditorTheme__listItem" value="1">
                <strong
                  class="PlaygroundEditorTheme__textBold"
                  data-lexical-text="true">
                  Fall 2024
                </strong>
              </li>
            </ul>
          </li>
        </ul>
      `,
    );
  });
  test('collapseAtStart for trivial bullet list', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <br />
          </li>
        </ul>
      `,
    );
    await pressBackspace(page);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto"><br /></p>
      `,
    );
  });
  test('collapseAtStart for bullet list with text', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('Hello World');
    await moveToLineBeginning(page);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <span data-lexical-text="true">Hello World</span>
          </li>
        </ul>
      `,
    );
    await pressBackspace(page);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <span data-lexical-text="true">Hello World</span>
        </p>
      `,
    );
  });
  test('collapseAtStart for bullet list with text inside autolink', async ({
    page,
    isCollab,
    browserName,
  }) => {
    await focusEditor(page, isCollab);
    await toggleBulletList(page, isCollab);
    await page.keyboard.type('www.example.com');
    await moveToLineBeginning(page);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <ul class="PlaygroundEditorTheme__ul" dir="auto">
          <li class="PlaygroundEditorTheme__listItem" value="1">
            <a
              class="PlaygroundEditorTheme__link"
              href="https://www.example.com">
              <span data-lexical-text="true">www.example.com</span>
            </a>
          </li>
        </ul>
      `,
    );
    await pressBackspace(page);
    await assertHTML(
      page,
      isCollab,
      browserName,
      html`
        <p class="PlaygroundEditorTheme__paragraph" dir="auto">
          <a class="PlaygroundEditorTheme__link" href="https://www.example.com">
            <span data-lexical-text="true">www.example.com</span>
          </a>
        </p>
      `,
    );
  });
});
