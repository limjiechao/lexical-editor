/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {BaseSelection, NodeKey, TextNode} from 'lexical';
import type {JSX} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$isAtNodeEnd} from '@lexical/selection';
import {mergeRegister} from '@lexical/utils';
import {
  $addUpdateTag,
  $createTextNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  HISTORY_MERGE_TAG,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useMemo} from 'react';

import {useToolbarState} from '../../context/ToolbarContext';
import {
  $createAutocompleteNode,
  AutocompleteNode,
} from '../../nodes/AutocompleteNode';
import {addSwipeRightListener} from '../../utils/swipe';
import DICTIONARY from './dictionary';

const HISTORY_MERGE = {tag: HISTORY_MERGE_TAG};

declare global {
  interface Navigator {
    userAgentData?: {
      mobile: boolean;
    };
  }
}

type AutocompleteQuery = {
  cancelQuery: () => void;
  rejectAutocomplete: () => void;
  queryResult: Promise<null | string>;
};

export const uuid = Math.random()
  .toString(36)
  .replace(/[^a-z]+/g, '')
  .substring(0, 5);

// TODO lookup should be custom
function $search(selection: null | BaseSelection): [boolean, string] {
  if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
    return [false, ''];
  }
  const node = selection.getNodes()[0];
  const anchor = selection.anchor;
  // Check siblings?
  if (!$isTextNode(node) || !node.isSimpleText() || !$isAtNodeEnd(anchor)) {
    return [false, ''];
  }
  const word = [];
  const text = node.getTextContent();
  let i = node.getTextContentSize();
  let c;
  while (i-- && i >= 0 && (c = text[i]) !== ' ') {
    word.push(c);
  }
  if (word.length === 0) {
    return [false, ''];
  }
  return [true, word.reverse().join('')];
}

// TODO query should be custom
function useQuery(): (searchText: string) => AutocompleteQuery {
  const server = useMemo(() => new AutocompleteServer(), []);

  return useCallback(
    (searchText: string) => {
      const response = server.query(searchText);
      return response;
    },
    [server],
  );
}

function formatSuggestionText(suggestion: string): string {
  const userAgentData = window.navigator.userAgentData;
  const isMobile =
    userAgentData !== undefined
      ? userAgentData.mobile
      : window.innerWidth <= 800 && window.innerHeight <= 600;

  return `${suggestion} ${isMobile ? '(SWIPE \u2B95)' : '(TAB)'}`;
}

export const AutocompleteQueryCancellation = Symbol(
  'Autocomplete Query Cancellation',
);

export default function AutocompletePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const query = useQuery();
  const {toolbarState} = useToolbarState();

  useEffect(() => {
    let autocompleteNodeKey: null | NodeKey = null;
    let lastMatch: null | string = null;
    let lastSuggestion: null | string = null;
    let searchPromise: null | AutocompleteQuery = null;
    let prevNodeFormat: number = 0;
    function $clearSuggestion() {
      const autocompleteNode =
        autocompleteNodeKey !== null
          ? $getNodeByKey(autocompleteNodeKey)
          : null;
      if (autocompleteNode !== null && autocompleteNode.isAttached()) {
        autocompleteNode.remove();
        autocompleteNodeKey = null;
      }
      if (searchPromise !== null) {
        searchPromise.cancelQuery();
        searchPromise = null;
      }
      lastMatch = null;
      lastSuggestion = null;
      prevNodeFormat = 0;
    }
    function $dismissSuggestion() {
      const autocompleteNode =
        autocompleteNodeKey !== null
          ? $getNodeByKey(autocompleteNodeKey)
          : null;
      if (autocompleteNode !== null && autocompleteNode.isAttached()) {
        autocompleteNode.remove();
        autocompleteNodeKey = null;
      }
      if (searchPromise !== null) {
        searchPromise.rejectAutocomplete();
        searchPromise = null;
      }
      lastSuggestion = null;
      prevNodeFormat = 0;
    }
    function $recurseSuggestion() {
      const autocompleteNode =
        autocompleteNodeKey !== null
          ? $getNodeByKey(autocompleteNodeKey)
          : null;
      if (autocompleteNode !== null && autocompleteNode.isAttached()) {
        autocompleteNode.remove();
        autocompleteNodeKey = null;
      }
      if (searchPromise !== null) {
        searchPromise.cancelQuery();
        searchPromise = null;
      }
      lastMatch += lastSuggestion!;
      prevNodeFormat = 0;
    }
    function asyncUpdateSuggestion(
      refSearchPromise: AutocompleteQuery,
      newSuggestion: null | string,
    ) {
      if (searchPromise !== refSearchPromise || newSuggestion === null) {
        // Outdated or no suggestion
        return;
      }
      editor.update(() => {
        const selection = $getSelection();
        const [hasMatch, match] = $search(selection);
        if (!hasMatch || match !== lastMatch || !$isRangeSelection(selection)) {
          // Outdated
          return;
        }
        const selectionCopy = selection.clone();
        const prevNode = selection.getNodes()[0] as TextNode;
        prevNodeFormat = prevNode.getFormat();
        const node = $createAutocompleteNode(
          formatSuggestionText(newSuggestion),
          uuid,
        )
          .setFormat(prevNodeFormat)
          .setStyle(`font-size: ${toolbarState.fontSize}`);
        autocompleteNodeKey = node.getKey();
        selection.insertNodes([node]);
        $setSelection(selectionCopy);
        lastSuggestion = newSuggestion;
      }, HISTORY_MERGE);
    }

    function $handleAutocompleteNodeTransform(node: AutocompleteNode) {
      const key = node.getKey();
      if (node.__uuid === uuid && key !== autocompleteNodeKey) {
        // Max one Autocomplete node per session
        $clearSuggestion();
      }
    }
    function handleUpdate() {
      editor.update(() => {
        const selection = $getSelection();
        const [hasMatch, match] = $search(selection);
        if (!hasMatch) {
          return;
        }
        if (match === lastMatch) {
          return;
        }
        const queryMatch = match === lastSuggestion ? lastMatch : match;
        $clearSuggestion();
        searchPromise = query(queryMatch!);
        searchPromise.queryResult
          .then((newSuggestion) => {
            if (searchPromise !== null) {
              asyncUpdateSuggestion(searchPromise, newSuggestion);
            }
          })
          .catch((e) => {
            if (e !== AutocompleteQueryCancellation) {
              console.error(e);
            }
          });
        lastMatch = match;
      }, HISTORY_MERGE);
    }
    function $handleAutocompleteIntent(): boolean {
      if (lastSuggestion === null || autocompleteNodeKey === null) {
        return false;
      }
      const autocompleteNode = $getNodeByKey(autocompleteNodeKey);
      if (autocompleteNode === null) {
        return false;
      }
      const textNode = $createTextNode(lastSuggestion)
        .setFormat(prevNodeFormat)
        .setStyle(`font-size: ${toolbarState.fontSize}`);
      autocompleteNode.replace(textNode);
      textNode.selectNext();
      $recurseSuggestion();
      return true;
    }
    function $handleKeypressCommand(e: Event) {
      if ($handleAutocompleteIntent()) {
        e.preventDefault();
        return true;
      }
      return false;
    }
    function $handleEscapeCommand(e: Event) {
      const hadSuggestion =
        autocompleteNodeKey !== null && lastSuggestion !== null;
      if (hadSuggestion) {
        e.preventDefault();
        $dismissSuggestion();
        return true;
      }
      return false;
    }
    function handleSwipeRight(_force: number, e: TouchEvent) {
      editor.update(() => {
        if ($handleAutocompleteIntent()) {
          e.preventDefault();
        } else {
          $addUpdateTag(HISTORY_MERGE.tag);
        }
      });
    }
    function unmountSuggestion() {
      editor.update(() => {
        $clearSuggestion();
      }, HISTORY_MERGE);
    }

    const rootElem = editor.getRootElement();

    return mergeRegister(
      editor.registerNodeTransform(
        AutocompleteNode,
        $handleAutocompleteNodeTransform,
      ),
      editor.registerUpdateListener(handleUpdate),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        $handleKeypressCommand,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $handleEscapeCommand,
        COMMAND_PRIORITY_LOW,
      ),
      ...(rootElem !== null
        ? [addSwipeRightListener(rootElem, handleSwipeRight)]
        : []),
      unmountSuggestion,
    );
  }, [editor, query, toolbarState.fontSize]);

  return null;
}

class CacheMap extends Map<string, string | null> {
  constructor(initial: [string, string | null][] = []) {
    super(initial);
  }

  public get(key: string): string {
    return super.get(key)!;
  }

  public set(key: string, value: string | null) {
    return super.set(key, value);
  }
}

/*
 * Simulate an asynchronous autocomplete server (typical in more common use cases like GMail where
 * the data is not static).
 */
class AutocompleteServer {
  public readonly DICTIONARY = DICTIONARY;
  private readonly CACHE = new CacheMap();
  private DELAY = 500;
  private THRESHOLD = 3;
  private TIMEOUT = setTimeout(() => {}, 0);

  private debounce(callback: () => void) {
    clearTimeout(this.TIMEOUT);

    this.TIMEOUT = setTimeout(callback, this.DELAY);
  }
  private validateSearchText(searchText: string) {
    const searchTextLength = searchText.length;

    return {
      searchTextIsBelowThreshold: searchTextLength < this.THRESHOLD,
      searchTextIsEmpty: searchTextLength === 0,
      searchTextLength,
    };
  }
  private prepareSearchText(searchText: string) {
    const char0 = searchText.charCodeAt(0);
    const isCapitalized = char0 >= 65 && char0 <= 90;
    const caseInsensitiveSearchText = isCapitalized
      ? String.fromCharCode(char0 + 32) + searchText.substring(1)
      : searchText;

    return {caseInsensitiveSearchText, isCapitalized};
  }
  private capitalizeMatch(match: string) {
    return String.fromCharCode(match.charCodeAt(0) - 32) + match.substring(1);
  }
  private autocomplete(searchText: string): Promise<string | null> {
    const {searchTextIsBelowThreshold, searchTextIsEmpty, searchTextLength} =
      this.validateSearchText(searchText);

    if (searchTextIsEmpty || searchTextIsBelowThreshold) {
      return Promise.resolve(null);
    }

    const {caseInsensitiveSearchText, isCapitalized} =
      this.prepareSearchText(searchText);

    if (this.CACHE.has(caseInsensitiveSearchText)) {
      return Promise.resolve(this.CACHE.get(caseInsensitiveSearchText)!);
    }

    const match = this.DICTIONARY.find(
      (dictionaryWord) =>
        dictionaryWord.startsWith(caseInsensitiveSearchText) &&
        dictionaryWord !== caseInsensitiveSearchText,
    );

    if (match === undefined) {
      this.CACHE.set(caseInsensitiveSearchText, null);
      return Promise.resolve(null);
    }

    const matchCapitalized = isCapitalized
      ? this.capitalizeMatch(match)
      : match;
    const autocompleteChunk = matchCapitalized.substring(searchTextLength);

    if (autocompleteChunk === '') {
      this.CACHE.set(caseInsensitiveSearchText, null);
      return Promise.resolve(null);
    }

    this.CACHE.set(caseInsensitiveSearchText, autocompleteChunk);
    return Promise.resolve(autocompleteChunk);
  }
  public query = (searchText: string): AutocompleteQuery => {
    let isCanceled = false;

    const rejectAutocomplete = () => {
      const caseInsensitiveSearchText =
        this.prepareSearchText(searchText).caseInsensitiveSearchText;
      this.CACHE.set(caseInsensitiveSearchText, null);
    };
    const cancelQuery = () => {
      isCanceled = true;
    };
    const queryResult: Promise<null | string> = new Promise(
      (resolve, reject) => {
        this.debounce(() => {
          if (isCanceled) {
            void this.autocomplete(searchText);
            return reject(AutocompleteQueryCancellation);
          }

          return resolve(this.autocomplete(searchText));
        });
      },
    );

    return {
      cancelQuery,
      queryResult,
      rejectAutocomplete,
    };
  };
}
