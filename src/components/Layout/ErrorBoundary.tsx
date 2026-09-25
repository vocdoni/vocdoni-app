import { Component, type ErrorInfo, type ReactNode } from 'react'
import { capturePosthogException } from '~utils/analytics'

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
    // React already logs caught errors to the console; error tracking only hooks uncaught ones.
    capturePosthogException(error, { component_stack: info.componentStack })
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
