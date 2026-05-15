// src/ui/plugin-bridge.ts
import { UIToMainMessage, MainToUIMessage } from '../types';

type MessageHandler = (msg: MainToUIMessage) => void;
const handlers: MessageHandler[] = [];

window.addEventListener('message', (event) => {
  const msg = event.data?.pluginMessage as MainToUIMessage;
  if (!msg) return;
  handlers.forEach(h => h(msg));
});

export function sendToMain(msg: UIToMainMessage) {
  parent.postMessage({ pluginMessage: msg }, '*');
}

export function onMainMessage(handler: MessageHandler) {
  handlers.push(handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx > -1) handlers.splice(idx, 1);
  };
}
