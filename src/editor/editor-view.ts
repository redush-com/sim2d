import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching } from '@codemirror/language';

/**
 * Creates and mounts a CodeMirror 6 editor in the given container.
 * @param container - DOM element to mount the editor in
 * @param initialCode - initial source code to display
 * @returns EditorView instance for reading/updating code
 */
export function createEditorView(container: HTMLElement, initialCode: string): EditorView {
  const state = EditorState.create({
    doc: initialCode,
    extensions: [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      closeBrackets(),
      bracketMatching(),
      javascript(),
      oneDark,
      keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap]),
      EditorView.theme({
        '&': { height: '100%', fontSize: '13px' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': { fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" },
      }),
    ],
  });

  return new EditorView({ state, parent: container });
}

/**
 * Gets the current code content from the editor.
 * @param view - EditorView instance
 * @returns the full document text
 */
export function getCode(view: EditorView): string {
  return view.state.doc.toString();
}

/**
 * Replaces the editor content with new code.
 * @param view - EditorView instance
 * @param code - new source code
 */
export function setCode(view: EditorView, code: string): void {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: code },
  });
}
