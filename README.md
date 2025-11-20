## Purpose

This library provides an extendable, production-ready wrapper around the Lexical playground: a reusable `<ExtendableEditor />` React component plus a curated set of nodes, themes, contexts, and plugins. It’s intended to be a starting point for building rich-text editors that you can customize with your own nodes, toolbar, and behaviors.

## How to set up and use `<ExtendableEditor />`

Here’s a minimal example for an external app that installed this package. Install and then import from the exported subpaths:

```bash
npm install extendable-lexical-editor react react-dom
```

Then use the component:

```tsx
'use client';

import {useState} from 'react';

import nodes from 'extendable-lexical-editor/editor-nodes';
import theme from 'extendable-lexical-editor/editor-theme';
import ExtendableEditor from 'extendable-lexical-editor/extendable-editor';

import 'extendable-lexical-editor/extendable-editor.css';

export default function RichTextEditor() {
  const [document, setDoc] = useState(null);

  return (
    <ExtendableEditor
      collabDocId="collaboration-TnnMG5W8MA" // identifier for collaboration room
      name="rich-text-editor"                // editor name (for diagnostics)
      namespace="app-name"                   // editor namespace (for serialization/source)
      nodes={nodes}                          // optional: extend with your own nodes
      theme={theme}                          // optional: customize styling
      initialDocument={document ?? undefined}
      onChangeDocument={setDoc}
      onSaveDocument={(document) => {
        // Invoked on Cmd/Ctrl+S (handled internally)
        console.log('Saved document:', document);
      }}
    />
  );
}
```

Notes:
- The component merges your `features` with sensible defaults; pass a partial config via the `features` prop only if you need overrides.
- Use `onChangeDocument` to keep external state in sync, and `onSaveDocument` to persist via Cmd/Ctrl+S.
- You can provide your own nodes array and theme to fully customize behavior and appearance.

## Using the serialized schema (Lexical JSON)

- For building strongly-typed `editorState` JSON, see the standalone schema in `types/LexicalSchema.d.ts`.
- Usage guide: [types/README.md](./types/README.md)
- Import path for consumers: `extendable-lexical-editor/lexical-schema`
