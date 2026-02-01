import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global Error Handler for "White Screen of Death"
// This ensures that if the app crashes before React mounts, you see the error on screen.
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
     root.innerHTML = `
      <div style="padding: 24px; font-family: system-ui, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444; margin-bottom: 12px;">Application Error</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
          The app failed to load. This usually happens due to missing API keys or a configuration issue.
        </p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; border: 1px solid #e2e8f0;">
          <code style="font-family: monospace; color: #dc2626;">${event.message}</code>
        </div>
        <p style="margin-top: 16px; color: #64748b; font-size: 14px;">
          Check your browser console or deployment logs for more details.
        </p>
      </div>
     `;
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);