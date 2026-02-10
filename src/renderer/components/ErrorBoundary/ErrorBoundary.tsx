import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, Button } from '../';
import { HiExclamationCircle } from 'react-icons/hi';
import './ErrorBoundary.css';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <Card>
            <CardBody>
              <div className="error-content">
                <HiExclamationCircle size={64} className="error-icon" />
                <h2>Oops! Something went wrong</h2>
                <p>
                  We're sorry for the inconvenience. The application encountered an unexpected
                  error.
                </p>
                {this.state.error && (
                  <details className="error-details">
                    <summary>Error details</summary>
                    <pre>{this.state.error.message}</pre>
                  </details>
                )}
                <div className="error-actions">
                  <Button variant="primary" onClick={this.handleReset}>
                    Return to Dashboard
                  </Button>
                  <Button variant="secondary" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
