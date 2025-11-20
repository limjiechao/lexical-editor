/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Standalone serialized schema for nodes registered in `PlaygroundNodes`.
 *
 * Source:
 * From "extendable-lexical-editor" NPM Package
 * - ./src/nodes/PlaygroundNodes.ts
 *
 * Purpose:
 * - Types for constructing valid Lexical JSON.
 * - Avoids importing from 'lexical' so this file is completely standalone.
 *
 * Notes:
 * - All nodes include `type` and `version` (always 1).
 * - Element-like nodes include `children` (array of serialized nodes) and common
 *   layout properties such as `direction`, `format`, and `indent`.
 * - Text-like nodes include `text`, `format`, `detail`, `mode`, and `style`.
 * - Decorator-like nodes have no `children` (rendered externally).
 * - Some nodes add their own properties (documented per node).
 *
 * This file intentionally models only the nodes listed in `PlaygroundNodes`.
 */

/* =========================================
 * Base primitives used by serialized shapes
 * ========================================= */

export type SerializedNodeVersion = 1;

export type ElementFormatType =
  | ''
  | 'left'
  | 'start'
  | 'center'
  | 'right'
  | 'end'
  | 'justify';

export type DirectionType = 'ltr' | 'rtl' | null;

export type TextModeType = 'normal' | 'token' | 'segmented';

/**
 * Minimal NodeState record shape used for JSON-serializable ad-hoc state.
 * See: https://lexical.dev/docs/concepts/node-state
 *
 * Override mechanism:
 * - Consumers can augment the exported `CustomNodeState` interface via module augmentation
 *   to provide a project-specific shape for the `$` NodeState payload.
 *
 * Example:
 *   declare module 'extendable-lexical-editor/lexical-schema' {
 *     interface CustomNodeState {
 *       metadata: { source: 'ai' | 'user' };
 *     }
 *   }
 *
 * `NodeStateRecord` will fall back to a generic record if `CustomNodeState` is not augmented.
 */
export interface CustomNodeState {}

type IsEmptyObject<T> = keyof T extends never ? true : false;

export type NodeStateRecord =
  IsEmptyObject<CustomNodeState> extends true
    ? {[key: string]: unknown}
    : CustomNodeState;

/**
 * The minimal base shape for any serialized node.
 *
 * Optional `$` NodeState uses `NodeStateRecord`, which can be augmented via `CustomNodeState`.
 */
export interface SerializedLexicalNode {
  type: string;
  version: SerializedNodeVersion;
  /**
   * Optional NodeState serialized under "$" per Lexical NodeState.
   * See: https://lexical.dev/docs/concepts/node-state
   */
  $?: NodeStateRecord;
}

/**
 * The base shape for element nodes (nodes that have children).
 */
export interface SerializedElementNode<
  TChild extends SerializedLexicalNode = SerializedLexicalNode,
> extends SerializedLexicalNode {
  children: TChild[];
  direction: DirectionType;
  format: ElementFormatType;
  indent: number;
  // Optional text style/format metadata at element level (present on some elements)
  textFormat?: number;
  textStyle?: string;
}

/**
 * The base shape for text nodes (leaf nodes that contain text).
 * `format` and `detail` are numeric bitmasks used by Lexical; leave as 0 if unsure.
 */
export interface SerializedTextNode extends SerializedLexicalNode {
  text: string;
  format: number;
  detail: number;
  mode: TextModeType;
  style: string;
}

/**
 * The nested-editor JSON used by ImageNode captions.
 * This mirrors Lexical's `SerializedEditor` (NOT stringified).
 */
export interface SerializedEditor {
  editorState: {
    root: SerializedRootNode;
  };
}

/* =========================================
 * Third-party/builtin nodes in PlaygroundNodes
 * ========================================= */

// @lexical/rich-text
// NOTE: Block heading element (h1–h6).
export interface SerializedHeadingNode extends SerializedElementNode {
  type: 'heading';
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  version: 1;
}

// NOTE: Block quote container for quoted text.
export interface SerializedQuoteNode extends SerializedElementNode {
  type: 'quote';
  version: 1;
}

// @lexical/list
export type ListType = 'number' | 'bullet' | 'check';
export type ListNodeTagType = 'ol' | 'ul';

// NOTE: Ordered, unordered, or checklist container.
export interface SerializedListNode extends SerializedElementNode {
  type: 'list';
  listType: ListType;
  start: number;
  tag: ListNodeTagType;
  version: 1;
}

// NOTE: Item within a list; may be nested and optionally checked for checklists.
export interface SerializedListItemNode extends SerializedElementNode {
  type: 'listitem';
  value: number;
  // Only meaningful for checklist items. Omit or set undefined if not checklist.
  checked?: boolean;
  version: 1;
}

// @lexical/code
// NOTE: Code block with optional language and theme metadata.
export interface SerializedCodeNode extends SerializedElementNode {
  type: 'code';
  language: string | null | undefined;
  theme?: string;
  version: 1;
}

// NOTE: Syntax-highlighted token segment inside a code block.
export interface SerializedCodeHighlightNode extends SerializedTextNode {
  type: 'code-highlight';
  highlightType: string | null | undefined;
  version: 1;
}

// @lexical/link
// NOTE: Hyperlink element wrapping inline content.
export interface SerializedLinkNode extends SerializedElementNode {
  type: 'link';
  url: string;
  rel?: string | null;
  target?: string | null;
  title?: string | null;
  version: 1;
}

// NOTE: Automatically detected hyperlink; behaves like LinkNode with auto-linking state.
export interface SerializedAutoLinkNode
  extends Omit<SerializedLinkNode, 'type'> {
  type: 'autolink';
  isUnlinked: boolean;
  version: 1;
}

// @lexical/overflow
// NOTE: Overflow container used to manage scrolling/overflow of content.
export interface SerializedOverflowNode extends SerializedElementNode {
  type: 'overflow';
  version: 1;
}

// @lexical/react HorizontalRuleNode (from @lexical/extension)
// NOTE: Horizontal rule divider line.
export interface SerializedHorizontalRuleNode extends SerializedLexicalNode {
  type: 'horizontalrule';
  version: 1;
}

// @lexical/rich-text ParagraphNode
// NOTE: Standard paragraph container for inline text.
export interface SerializedParagraphNode extends SerializedElementNode {
  type: 'paragraph';
  version: 1;
}

// @lexical/mark
// NOTE: Range marker element for annotations/marking content by id(s).
export interface SerializedMarkNode extends SerializedElementNode {
  type: 'mark';
  ids: string[];
  version: 1;
}

// @lexical/table
// NO_STATUS = 0, ROW = 1, COLUMN = 2, BOTH = 3
export type TableCellHeaderState = 0 | 1 | 2 | 3;

// NOTE: Table container with optional column widths and frozen rows/columns.
export interface SerializedTableNode extends SerializedElementNode {
  type: 'table';
  colWidths?: readonly number[];
  rowStriping?: boolean;
  frozenColumnCount?: number;
  frozenRowCount?: number;
  version: 1;
}

// NOTE: Table row with optional height.
export interface SerializedTableRowNode extends SerializedElementNode {
  type: 'tablerow';
  height?: number;
  version: 1;
}

// NOTE: Table cell with header state, spans, and styling options.
export interface SerializedTableCellNode extends SerializedElementNode {
  type: 'tablecell';
  headerState: TableCellHeaderState;
  colSpan?: number;
  rowSpan?: number;
  width?: number;
  backgroundColor?: string | null;
  verticalAlign?: string;
  version: 1;
}

/* =========================================
 * Custom nodes in PlaygroundNodes
 * ========================================= */

// SpecialTextNode (TextEntity)
// NOTE: Inline text entity with custom rendering/behavior.
export interface SerializedSpecialTextNode extends SerializedTextNode {
  type: 'specialText';
  version: 1;
}

// AutocompleteNode (TextEntity)
// NOTE: Inline text entity representing an autocomplete token/value.
export interface SerializedAutocompleteNode extends SerializedTextNode {
  type: 'autocomplete';
  uuid: string;
  version: 1;
}

// ImageNode (Decorator)
// NOTE: Decorator for images with optional nested-editor caption.
export interface SerializedImageNode extends SerializedLexicalNode {
  type: 'image';
  altText: string;
  caption: SerializedEditor; // Nested editor JSON
  height?: number; // 0 means inherit when exported
  maxWidth: number;
  showCaption: boolean;
  src: string;
  width?: number; // 0 means inherit when exported
  version: 1;
}

// EquationNode (Decorator)
// NOTE: KaTeX equation decorator (inline or block).
export interface SerializedEquationNode extends SerializedLexicalNode {
  type: 'equation';
  equation: string; // KaTeX source
  inline: boolean; // inline vs block display
  version: 1;
}

// FootnoteNode (Decorator)
// NOTE: Footnote marker with a stringified nested-editor payload and index.
export interface SerializedFootnoteNode extends SerializedLexicalNode {
  type: 'footnote';
  index: number;
  value: string; // serialized editor state string (as used in plugin) or text content
  version: 1;
}

// PageBreakNode (Decorator)
// NOTE: Hard page break used for paginated output.
export interface SerializedPageBreakNode extends SerializedLexicalNode {
  type: 'page-break';
  version: 1;
}

// LayoutContainerNode (Element)
// NOTE: Grid container specifying template columns for multi-column layout.
export interface SerializedLayoutContainerNode extends SerializedElementNode {
  type: 'layout-container';
  templateColumns: string; // CSS grid-template-columns
  version: 1;
}

// LayoutItemNode (Element)
// NOTE: Item within a layout container (one grid column segment).
export interface SerializedLayoutItemNode extends SerializedElementNode {
  type: 'layout-item';
  version: 1;
}

/* =========================================
 * Union helpers for convenience
 * ========================================= */

export type PlaygroundNodeTypeString =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'listitem'
  | 'quote'
  | 'code'
  | 'table'
  | 'tablecell'
  | 'tablerow'
  | 'code-highlight'
  | 'autolink'
  | 'link'
  | 'overflow'
  | 'image'
  | 'equation'
  | 'autocomplete'
  | 'horizontalrule'
  | 'mark'
  | 'page-break'
  | 'layout-container'
  | 'layout-item'
  | 'specialText'
  | 'footnote';

export type SerializedPlaygroundNode =
  | SerializedHeadingNode
  | SerializedParagraphNode
  | SerializedListNode
  | SerializedListItemNode
  | SerializedQuoteNode
  | SerializedCodeNode
  | SerializedTableNode
  | SerializedTableCellNode
  | SerializedTableRowNode
  | SerializedCodeHighlightNode
  | SerializedAutoLinkNode
  | SerializedLinkNode
  | SerializedOverflowNode
  | SerializedImageNode
  | SerializedEquationNode
  | SerializedAutocompleteNode
  | SerializedHorizontalRuleNode
  | SerializedMarkNode
  | SerializedPageBreakNode
  | SerializedLayoutContainerNode
  | SerializedLayoutItemNode
  | SerializedSpecialTextNode
  | SerializedFootnoteNode;

/**
 * Optional convenience: a minimal document root shape that can host any of the nodes above.
 * This is not part of PlaygroundNodes but included to help consumers assemble complete documents.
 */
export interface SerializedRootNode
  extends SerializedElementNode<SerializedPlaygroundNode | SerializedTextNode> {
  type: 'root';
  version: 1;
}

/**
 * Full saved file shape as exported by the Playground.
 */
export interface SerializedPlaygroundFile {
  editorState: {
    root: SerializedRootNode;
  };
  lastSaved: number;
  source: string;
  version: string;
}
