/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/*
 * A custom node used to render footnotes inline in the editor.
 * Footnotes are implemented as a DecoratorNode so their DOM is
 * rendered via React rather than text.
 */
import type {
  EditorConfig,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import type {JSX} from 'react';

import './FootnoteNode.css';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {createCommand, DecoratorNode} from 'lexical';
import {useCallback, useState} from 'react';

import PlaygroundEditorTheme from '../themes/PlaygroundEditorTheme';
import Button from '../ui/Button';

/*
 * FootnoteComponent renders a numbered cue and a popover with
 * the footnote text on hover.  It uses inline styles to keep
 * the example self‑contained; production code should extract
 * these into CSS.
 */
export function FootnoteComponent({
  index,
  value,
  nodeKey,
}: {
  index: number;
  value: string;
  nodeKey: string;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const [editor] = useLexicalComposerContext();

  const handleEdit = useCallback(() => {
    editor.dispatchCommand(EDIT_FOOTNOTE_COMMAND, {key: nodeKey});
  }, [editor, nodeKey]);

  return (
    <span
      className="FootnoteNode__container"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      <sup className="FootnoteNode__superscript">{index}</sup>
      {show && (
        <div className="FootnoteNode__popover">
          <LexicalComposer
            initialConfig={{
              editable: false,
              // serialized state is parsed automatically
              editorState: value,
              namespace: 'FootnoteReadOnly',
              nodes: [],
              onError(error) {
                throw error;
              },
              theme: PlaygroundEditorTheme,
            }}>
            <div className="FootnoteNode__value">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable style={{minHeight: '0', padding: 0}} />
                }
                placeholder={null}
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </LexicalComposer>
          <Button className="FootnoteNode__edit-button" onClick={handleEdit}>
            Edit
          </Button>
        </div>
      )}
    </span>
  );
}

export type SerializedFootnoteNode = Spread<
  {index: number; value: string},
  SerializedLexicalNode
>;

/*
 * A DecoratorNode holding the footnote index and value.  See the GitHub
 * discussion on footnotes where collaborators note that footnotes are
 * conceptually similar to comments and can be implemented with a custom
 * DecoratorNode.
 */
export class FootnoteNode extends DecoratorNode<JSX.Element> {
  __index: number;
  __value: string;

  static getType(): string {
    return 'footnote';
  }

  static clone(node: FootnoteNode): FootnoteNode {
    return new FootnoteNode(node.__value, node.__index, node.__key);
  }

  constructor(value: string, index = 0, key?: NodeKey) {
    super(key);
    this.__value = value;
    this.__index = index;
  }

  // NOTE: Public setter for the index; uses getWritable() so Lexical knows the node was mutated.
  setIndex(newIndex: number): void {
    const writable = this.getWritable();
    writable.__index = newIndex;
  }

  // NOTE: Public setter for the value; uses getWritable() so Lexical knows the node was mutated.
  setValue(newValue: string): void {
    const writable = this.getWritable();
    writable.__value = newValue;
  }

  exportJSON(): SerializedFootnoteNode {
    return {
      ...super.exportJSON(),
      index: this.__index,
      type: 'footnote',
      value: this.__value,
      version: 1,
    };
  }

  static importJSON(serialised: SerializedFootnoteNode): FootnoteNode {
    const {value, index} = serialised;
    return new FootnoteNode(value, index).updateFromJSON(serialised);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    // Return a container element; Lexical will call decorate() to render React.
    return document.createElement('span');
  }

  updateDOM(): boolean {
    // The React component controls the DOM; no manual updates needed.
    return false;
  }

  decorate(): JSX.Element {
    // Pass the serialized editor state to the popover
    return (
      <FootnoteComponent
        index={this.__index}
        value={this.__value}
        nodeKey={this.getKey()}
      />
    );
  }
}

/*
 * Lexical command to insert a footnote.
 *
 * The payload is the note text; numbering is handled by the plugin.
 */
export const INSERT_FOOTNOTE_COMMAND: LexicalCommand<{value: string}> =
  createCommand('INSERT_FOOTNOTE_COMMAND');

/*
 * Lexical command to edit a footnote.
 *
 * The payload is the key of the footnote to edit.
 */
export const EDIT_FOOTNOTE_COMMAND: LexicalCommand<{key: string}> =
  createCommand('EDIT_FOOTNOTE_COMMAND');

/*
 * Check if a node is a FootnoteNode.
 * @param node - The node to check.
 * @returns True if the node is a FootnoteNode, false otherwise.
 */
export function $isFootnoteNode(
  node: LexicalNode | null | undefined,
): node is FootnoteNode {
  return node instanceof FootnoteNode;
}
