// Reusable confirmation dialog using native <dialog> — research.md R9.
// Resolves true only when the user presses the confirm button; Esc/Cancel → false.

let counter = 0;

export function confirmDialog({ title, body, confirmLabel = 'Delete', cancelLabel = 'Cancel' }) {
  return new Promise((resolve) => {
    const id = `dialog-${++counter}`;
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog';
    dialog.setAttribute('aria-labelledby', `${id}-title`);
    dialog.setAttribute('aria-describedby', `${id}-body`);
    dialog.innerHTML = `
      <form method="dialog">
        <h2 id="${id}-title"></h2>
        <p id="${id}-body"></p>
        <div class="button-row">
          <button class="btn btn--ghost" value="cancel" data-role="cancel"></button>
          <button class="btn btn--danger" value="confirm"></button>
        </div>
      </form>`;
    dialog.querySelector('h2').textContent = title;
    dialog.querySelector('p').textContent = body;
    const cancelBtn = dialog.querySelector('[value="cancel"]');
    cancelBtn.textContent = cancelLabel;
    dialog.querySelector('[value="confirm"]').textContent = confirmLabel;

    const opener = document.activeElement;
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'confirm');
      dialog.remove();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    });

    document.body.append(dialog);
    dialog.showModal();
    cancelBtn.focus(); // safest default
  });
}
