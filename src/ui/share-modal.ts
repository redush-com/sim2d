import { createShareLink, buildShareUrl } from '../db/shared-links';

/**
 * Creates and injects the modal stylesheet into the document if not already present.
 * @returns the existing or newly created style element
 */
function ensureStyles(): HTMLStyleElement {
	const existing = document.getElementById('share-modal-styles') as HTMLStyleElement | null;
	if (existing) return existing;

	const style = document.createElement('style');
	style.id = 'share-modal-styles';
	style.textContent = `
    .share-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; animation: share-fade-in 0.15s ease;
    }
    @keyframes share-fade-in { from { opacity: 0; } to { opacity: 1; } }
    .share-modal {
      background: #12121a; border: 1px solid #1e1e2a; border-radius: 10px;
      padding: 28px 32px; min-width: 380px; max-width: 440px; width: 90%;
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
    }
    .share-title { font-size: 18px; font-weight: 600; color: #c8c8d0; margin-bottom: 20px; }
    .share-url-row { display: flex; gap: 8px; margin-bottom: 16px; }
    .share-url-input {
      flex: 1; padding: 8px 12px; background: #0a0a12; border: 1px solid #1e1e2a;
      border-radius: 6px; color: #c8c8d0; font-size: 13px; outline: none;
    }
    .share-btn {
      padding: 8px 18px; border: 1px solid #2a2a3a; border-radius: 6px;
      background: #14141e; color: #c8c8d0; font-size: 13px; cursor: pointer;
      transition: all 0.15s;
    }
    .share-btn:hover { border-color: #4a4a60; color: #fff; }
    .share-btn-primary { background: #5588ff; border-color: #5588ff; color: #fff; }
    .share-btn-primary:hover { background: #6699ff; border-color: #6699ff; }
    .share-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .share-error { color: #cc6666; font-size: 12px; margin-bottom: 12px; }
    .share-footer { display: flex; justify-content: flex-end; margin-top: 8px; }
  `;
	document.head.appendChild(style);
	return style;
}

/**
 * Builds the modal card DOM structure with generate, copy, and close controls.
 * @param simulationId - the simulation to generate a share link for
 * @param onClose - callback to tear down the modal overlay
 * @returns the modal card element
 */
function buildModalCard(simulationId: string, onClose: () => void): HTMLElement {
	const card = document.createElement('div');
	card.className = 'share-modal';

	const title = document.createElement('div');
	title.className = 'share-title';
	title.textContent = 'Share Simulation';
	card.appendChild(title);

	const urlRow = document.createElement('div');
	urlRow.className = 'share-url-row';
	urlRow.style.display = 'none';

	const urlInput = document.createElement('input');
	urlInput.className = 'share-url-input';
	urlInput.readOnly = true;

	const copyBtn = document.createElement('button');
	copyBtn.className = 'share-btn';
	copyBtn.textContent = 'Copy';
	copyBtn.addEventListener('click', () => handleCopy(urlInput, copyBtn));

	urlRow.appendChild(urlInput);
	urlRow.appendChild(copyBtn);
	card.appendChild(urlRow);

	const errorEl = document.createElement('div');
	errorEl.className = 'share-error';
	errorEl.style.display = 'none';
	card.appendChild(errorEl);

	const generateBtn = document.createElement('button');
	generateBtn.className = 'share-btn share-btn-primary';
	generateBtn.textContent = 'Generate Link';
	generateBtn.addEventListener('click', () => {
		handleGenerate(simulationId, generateBtn, urlRow, urlInput, errorEl);
	});
	card.appendChild(generateBtn);

	const footer = document.createElement('div');
	footer.className = 'share-footer';
	const closeBtn = document.createElement('button');
	closeBtn.className = 'share-btn';
	closeBtn.textContent = 'Close';
	closeBtn.addEventListener('click', onClose);
	footer.appendChild(closeBtn);
	card.appendChild(footer);

	return card;
}

/**
 * Handles the generate-link flow: shows loading state, calls the API, and reveals the URL.
 * @param simulationId - simulation to share
 * @param generateBtn - the generate button to update
 * @param urlRow - the row to reveal on success
 * @param urlInput - the input to populate with the share URL
 * @param errorEl - the element for error messaging
 */
async function handleGenerate(
	simulationId: string,
	generateBtn: HTMLButtonElement,
	urlRow: HTMLElement,
	urlInput: HTMLInputElement,
	errorEl: HTMLElement,
): Promise<void> {
	generateBtn.disabled = true;
	generateBtn.textContent = 'Generating...';
	errorEl.style.display = 'none';

	const link = await createShareLink(simulationId);

	if (!link) {
		errorEl.textContent = 'Failed to generate share link. Please try again.';
		errorEl.style.display = 'block';
		generateBtn.disabled = false;
		generateBtn.textContent = 'Generate Link';
		return;
	}

	const url = buildShareUrl(link.share_token);
	urlInput.value = url;
	urlRow.style.display = 'flex';
	generateBtn.style.display = 'none';
}

/**
 * Copies the share URL to the clipboard and shows brief "Copied!" feedback.
 * @param urlInput - input element containing the URL
 * @param copyBtn - button to update with feedback text
 */
async function handleCopy(urlInput: HTMLInputElement, copyBtn: HTMLButtonElement): Promise<void> {
	try {
		await navigator.clipboard.writeText(urlInput.value);
		copyBtn.textContent = 'Copied!';
		setTimeout(() => {
			copyBtn.textContent = 'Copy';
		}, 2000);
	} catch {
		urlInput.select();
	}
}

/**
 * Displays a modal overlay for sharing a simulation via a generated link.
 * Creates the overlay, modal card, and event listeners for closing.
 * @param simulationId - the ID of the simulation to share
 */
export function showShareModal(simulationId: string): void {
	ensureStyles();

	const overlay = document.createElement('div');
	overlay.className = 'share-overlay';

	const close = (): void => {
		overlay.remove();
	};

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) close();
	});

	const card = buildModalCard(simulationId, close);
	overlay.appendChild(card);
	document.body.appendChild(overlay);
}
