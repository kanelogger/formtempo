// Selection-based fallback follows the Archify site interaction.
export async function copyText(text: string, isCurrent = () => true) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Some browsers deny Clipboard access even during a click.
  }

  if (!isCurrent()) return false;
  const focused = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.cssText = "position:fixed;inset:0 auto auto 0;opacity:0;pointer-events:none";
  document.body.append(field);

  try {
    field.select();
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
    if (focused instanceof HTMLElement) focused.focus({ preventScroll: true });
  }
}
