import { Component, type ErrorInfo, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Rendered instead of `children` once they throw while rendering. */
  fallback: ReactNode
}

type ErrorBoundaryState = {
  failed: boolean
}

/**
 * Contains a render error to the subtree that threw, so one bad item degrades on its own
 * instead of taking down the whole route through its `errorElement`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swallowed errors stay visible in the console (and in whatever captures it).
    console.error(error, info.componentStack)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
