export function emitWelcomePreview(text) {
  try {
    sessionStorage.setItem('pending_welcome_message', text);
    window.dispatchEvent(new CustomEvent('welcomeMessageReady', { detail: text }));
  } catch {}
}
