import { Component } from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[portfolio] uncaught error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="error-screen">
        <div className="glass section__panel" style={{ maxWidth: 520, textAlign: 'center' }}>
          <p className="section__eyebrow">Something went overboard</p>
          <h1 className="section__title" style={{ fontSize: 'var(--text-2xl)' }}>
            The current took an unexpected turn
          </h1>
          <p className="section__lead" style={{ margin: '0 auto var(--space-lg)' }}>
            A reload usually settles the water.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => window.location.reload()}
          >
            Reload the page
          </button>
        </div>
      </div>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};
