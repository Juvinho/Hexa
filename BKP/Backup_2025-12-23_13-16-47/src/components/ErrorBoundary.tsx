import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#1a1a1a', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ maxWidth: '500px', padding: '2rem', border: '2px solid red', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '1rem', color: 'red' }}>Algo deu errado</h2>
            <p style={{ marginBottom: '1rem' }}>Ocorreu um erro inesperado.</p>
            <pre style={{ backgroundColor: '#000', padding: '10px', borderRadius: '4px', overflow: 'auto', textAlign: 'left', marginBottom: '1rem' }}>
              {this.state.error?.message}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
