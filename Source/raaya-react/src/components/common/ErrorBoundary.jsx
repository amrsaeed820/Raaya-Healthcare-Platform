import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', margin: '20px' }}>
                    <h3>Something went wrong.</h3>
                    <p>{this.state.error && this.state.error.toString()}</p>
                    <pre style={{ overflowX: 'auto', background: '#f8717122', padding: '10px' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
