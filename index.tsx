
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Debug helper
const logToScreen = (msg: string) => {
  console.log(msg);
  const loadingDisplay = document.getElementById('loading-display');
  if (loadingDisplay) {
    loadingDisplay.textContent = msg;
  }
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-900">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <pre className="whitespace-pre-wrap text-sm">{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

logToScreen('Initializing application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = createRoot(rootElement);
  logToScreen('Mounting React components...');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  // Clear loading message after a short delay if render succeeds (though App should replace it)
  setTimeout(() => {
    const loading = document.getElementById('loading-display');
    if (loading && document.getElementById('root')?.childElementCount === 0) {
       // If root is still empty, something might be wrong
       loading.textContent = 'Application mounted but nothing rendered. Check console.';
    }
  }, 3000);

} catch (e: any) {
  console.error("Fatal initialization error:", e);
  logToScreen(`Fatal initialization error: ${e.message}`);
}