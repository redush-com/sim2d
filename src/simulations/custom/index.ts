import { register } from '../registry';
import type { SimulationInstance } from '../types';
import { createLoop } from '../../loop';
import { SimulationSandbox } from './sandbox';
import { createEditorView, getCode, setCode } from '../../editor/editor-view';
import { getTemplates } from '../../editor/templates';
import { clearCanvas } from '../../rendering/shared';

/**
 * Creates a custom simulation instance with a code editor and sandbox.
 * @param canvas - the canvas element for rendering
 * @param panel - the side panel element for the editor
 * @returns a controllable simulation instance
 */
function createCustomSimulation(
  canvas: HTMLCanvasElement,
  panel: HTMLElement
): SimulationInstance {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D rendering context');

  const sandbox = new SimulationSandbox();
  let running = false;

  // DPI scaling
  const applyDpi = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  };
  applyDpi();

  // Build panel UI
  panel.innerHTML = '';
  addEditorStyles(panel);

  const title = document.createElement('h1');
  title.className = 'editor-title';
  title.textContent = 'Custom Simulation';
  panel.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'editor-subtitle';
  subtitle.textContent = 'Write init() and tick() functions. Use ctx to draw on the canvas.';
  panel.appendChild(subtitle);

  // Template selector
  const templates = getTemplates();
  const templateRow = document.createElement('div');
  templateRow.className = 'editor-template-row';
  const templateLabel = document.createElement('span');
  templateLabel.textContent = 'Template:';
  templateLabel.className = 'editor-template-label';
  templateRow.appendChild(templateLabel);

  for (const tmpl of templates) {
    const btn = document.createElement('button');
    btn.className = 'editor-template-btn';
    btn.textContent = tmpl.name;
    btn.addEventListener('click', () => { setCode(editorView, tmpl.code); });
    templateRow.appendChild(btn);
  }
  panel.appendChild(templateRow);

  // Code editor container
  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';
  panel.appendChild(editorContainer);

  const editorView = createEditorView(editorContainer, templates[0].code);

  // Error display
  const errorDisplay = document.createElement('div');
  errorDisplay.className = 'editor-error';
  panel.appendChild(errorDisplay);

  // Button row
  const btnRow = document.createElement('div');
  btnRow.className = 'editor-btn-row';

  const runBtn = document.createElement('button');
  runBtn.className = 'editor-run-btn';
  runBtn.textContent = 'Run';

  const stopBtn = document.createElement('button');
  stopBtn.className = 'editor-stop-btn';
  stopBtn.textContent = 'Stop';

  btnRow.appendChild(runBtn);
  btnRow.appendChild(stopBtn);
  panel.appendChild(btnRow);

  // Info
  const info = document.createElement('div');
  info.className = 'editor-info';
  info.innerHTML = 'Define <code>init({ width, height })</code> and <code>tick(state, dt, ctx)</code>.<br/>The ctx object supports standard Canvas2D drawing methods.';
  panel.appendChild(info);

  const loop = createLoop(
    (dt) => {
      if (!sandbox.isReady()) return;
      sandbox.tick(dt, ctx);
      const err = sandbox.getError();
      errorDisplay.textContent = err || '';
      errorDisplay.style.display = err ? 'block' : 'none';
      if (err) loop.stop();
    },
    () => {} // drawing happens in sandbox.tick via command replay
  );

  /** Compiles code, initializes, and starts the loop */
  const runCode = () => {
    const code = getCode(editorView);
    sandbox.compile(code);

    const err = sandbox.getError();
    if (err) {
      errorDisplay.textContent = err;
      errorDisplay.style.display = 'block';
      return;
    }

    errorDisplay.style.display = 'none';
    applyDpi();
    sandbox.initialize(canvas.clientWidth, canvas.clientHeight);

    if (sandbox.getError()) {
      errorDisplay.textContent = sandbox.getError()!;
      errorDisplay.style.display = 'block';
      return;
    }

    loop.start();
    running = true;
  };

  runBtn.addEventListener('click', () => {
    loop.stop();
    clearCanvas(ctx, canvas.clientWidth, canvas.clientHeight);
    runCode();
  });

  stopBtn.addEventListener('click', () => {
    loop.stop();
    running = false;
  });

  const handleResize = () => {
    applyDpi();
    if (running && sandbox.isReady()) {
      sandbox.initialize(canvas.clientWidth, canvas.clientHeight);
    }
  };
  window.addEventListener('resize', handleResize);

  return {
    start: () => { runCode(); },
    stop: () => { loop.stop(); },
    destroy: () => {
      loop.stop();
      editorView.destroy();
      window.removeEventListener('resize', handleResize);
    },
  };
}

/**
 * Adds CSS styles for the editor panel.
 * @param panel - the panel element
 */
function addEditorStyles(panel: HTMLElement): void {
  const style = document.createElement('style');
  style.textContent = `
    .editor-title { font-size: 15px; font-weight: 600; color: #e0e0e8; margin-bottom: 4px; }
    .editor-subtitle { font-size: 11px; color: #666; margin-bottom: 8px; line-height: 1.4; }
    .editor-template-row { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
    .editor-template-label { font-size: 11px; color: #666; }
    .editor-template-btn {
      padding: 3px 10px; border: 1px solid #2a2a3a; border-radius: 4px;
      background: #14141e; color: #888; font-size: 11px; cursor: pointer;
      transition: all 0.15s;
    }
    .editor-template-btn:hover { border-color: #4a4a60; color: #ccc; }
    .editor-container {
      flex: 1; min-height: 200px; border: 1px solid #1e1e2a; border-radius: 6px;
      overflow: hidden;
    }
    .editor-error {
      display: none; padding: 8px 12px; margin-top: 6px;
      background: rgba(255, 60, 60, 0.1); border: 1px solid rgba(255, 60, 60, 0.3);
      border-radius: 6px; font-size: 12px; color: #ff6666; font-family: monospace;
    }
    .editor-btn-row { display: flex; gap: 8px; margin-top: 8px; }
    .editor-run-btn, .editor-stop-btn {
      flex: 1; padding: 8px 0; border-radius: 6px; font-size: 12px;
      font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .editor-run-btn {
      background: #1a3a1a; border: 1px solid #2a5a2a; color: #66cc66;
    }
    .editor-run-btn:hover { background: #1a4a1a; border-color: #3a7a3a; }
    .editor-stop-btn {
      background: #3a1a1a; border: 1px solid #5a2a2a; color: #cc6666;
    }
    .editor-stop-btn:hover { background: #4a1a1a; border-color: #7a3a3a; }
    .editor-info {
      margin-top: auto; padding-top: 12px; border-top: 1px solid #1a1a24;
      font-size: 10px; color: #444; line-height: 1.5;
    }
    .editor-info code { color: #5588ff; font-size: 10px; }
    .sim-panel { width: 380px !important; }
  `;
  panel.appendChild(style);
}

register({
  id: 'custom',
  title: 'Custom Simulation',
  description: 'Write your own simulation in JavaScript. Define init() and tick() functions, use ctx to draw on the canvas. Includes starter templates.',
  tags: ['custom', 'sandbox', 'code-editor', 'javascript'],
  create: createCustomSimulation,
});
