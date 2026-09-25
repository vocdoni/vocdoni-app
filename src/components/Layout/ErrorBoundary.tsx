import { Component, type ErrorInfo, type ReactNode } from 'react'
import { capturePosthogException } from '~utils/analytics'

type ErrorBoundaryProps = {
  children: ReactNode
  /** Rendered instead of `children` once they throw while rendering. */
  fallback: ReactNode
  /**
   * Once failed, the boundary retries its children whenever one of these changes (by `Object.is`),
   * so fresh data gets a chance to render instead of the fallback sticking for good.
   */
  resetKeys?: readonly unknown[]
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

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Only reset a boundary that had already failed before this update: the render that fails is
    // also the one that may bring new keys, and resetting on it would just re-throw right away.
    if (!prevState.failed || !this.state.failed) return
    const prev = prevProps.resetKeys ?? []
    const next = this.props.resetKeys ?? []
    if (prev.length !== next.length || prev.some((key, index) => !Object.is(key, next[index]))) {
      this.setState({ failed: false })
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // React already logs caught errors to the console; error tracking only hooks uncaught ones.
    capturePosthogException(error, { component_stack: info.componentStack })
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
