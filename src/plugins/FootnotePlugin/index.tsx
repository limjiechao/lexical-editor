/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/*
 * The FootnotePlugin
 * - registers the INSERT_FOOTNOTE_COMMAND,
 * - maintains a running count of inserted footnotes, and
 * - exposes a dialog for authoring footnote content.
 *
 * It relies on the playground's modal helper.
 */

import type {LexicalEditor, LexicalNode} from 'lexical';
import type {JSX} from 'react';

import './index.css';

import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {EditorRefPlugin} from '@lexical/react/LexicalEditorRefPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  COMMAND_PRIORITY_EDITOR,
  RootNode,
} from 'lexical';
import {useCallback, useEffect, useRef} from 'react';
import * as React from 'react';

import useModal from '../../hooks/useModal';
import {
  $isFootnoteNode,
  EDIT_FOOTNOTE_COMMAND,
  FootnoteNode,
  INSERT_FOOTNOTE_COMMAND,
} from '../../nodes/FootnoteNode';
import PlaygroundEditorTheme from '../../themes/PlaygroundEditorTheme';
import Button from '../../ui/Button';
import ContentEditable from '../../ui/ContentEditable';
import {DialogActions} from '../../ui/Dialog';

function FootnoteDialog({
  onInsert,
  onClose,
  initialValue = '',
}: {
  onInsert: (value: string) => void;
  onClose: () => void;
  initialValue?: string;
}): JSX.Element {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    editorState: initialValue || undefined, // prefill from existing value
    namespace: 'FootnoteEditor',
    nodes: [],
    onError(error: Error) {
      throw error;
    },
    theme: PlaygroundEditorTheme,
  };

  const handleInsert = React.useCallback(() => {
    const nested = editorRef.current;

    if (!nested) {
      return;
    }

    const editorState = nested.getEditorState();
    const serialized = JSON.stringify(editorState);

    onInsert(serialized);
    onClose();
  }, [onInsert, onClose]);

  return (
    <div className="FootnoteDialog">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="FootnoteDialog__editor"
              placeholder="Type your footnote…"
              placeholderClassName="FootnoteDialog__editor-placeholder"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <EditorRefPlugin editorRef={editorRef} />
      </LexicalComposer>

      <DialogActions>
        <Button onClick={handleInsert} data-test-id="footnote-modal-insert-btn">
          Insert
        </Button>
      </DialogActions>
    </div>
  );
}

/** The plugin registers the command handler, provides a way to open
 * the dialog and stores the next footnote index.  It renders only
 * the modal returned from useModal().
 */
export default function FootnotePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();

  // NOTE: Root transform: renumber all footnotes in document order.
  useEffect(() => {
    return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
      let nextIndex = 1;
      function traverse(node: LexicalNode) {
        // Loop through children
        if ($isElementNode(node)) {
          for (const child of node.getChildren()) {
            // If it’s a FootnoteNode, update its index if necessary
            if ($isFootnoteNode(child)) {
              if (child.__index !== nextIndex) {
                // Only call setIndex when the number actually changes
                (child as FootnoteNode).setIndex(nextIndex);
              }
              nextIndex++;
            }
            // Recurse into child
            traverse(child);
          }
        }
      }
      traverse(rootNode);
    });
  }, [editor]);

  // Insert footnote command remains the same, but set initial index to zero.
  const insertFootnote = useCallback(
    (value: string) => {
      editor.update(() => {
        const node = new FootnoteNode(value, 0);
        const selection = $getSelection();
        if (selection) {
          selection.insertNodes([node]);
        }
      });
    },
    [editor],
  );
  useEffect(() => {
    return editor.registerCommand(
      INSERT_FOOTNOTE_COMMAND,
      (payload) => {
        showModal('Add footnote', (onClose) => (
          <FootnoteDialog
            onInsert={(value) => insertFootnote(value)}
            onClose={onClose}
          />
        ));
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, insertFootnote, showModal]);

  useEffect(() => {
    return editor.registerCommand(
      EDIT_FOOTNOTE_COMMAND,
      ({key}) => {
        // Look up the footnote node inside a read to avoid mutation
        const footnoteValue = editor.getEditorState().read(() => {
          const node = $getNodeByKey(key);
          return $isFootnoteNode(node) ? node.__value : '';
        });

        // Show a modal prefilled with the footnote text
        showModal('Edit footnote', (onClose) => (
          <FootnoteDialog
            initialValue={footnoteValue}
            onInsert={(newValue) => {
              // Write the new value back to the node
              editor.update(() => {
                const node = $getNodeByKey(key);
                if ($isFootnoteNode(node)) {
                  (node as FootnoteNode).setValue(newValue);
                }
              });
            }}
            onClose={onClose}
          />
        ));
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor, showModal]);

  return <>{modal}</>;
}
