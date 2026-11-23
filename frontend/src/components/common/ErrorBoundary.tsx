import { Component, type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: "" }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // In production: send to error reporting service (e.g. Sentry)
    // console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-error" />
            </div>
            <h2 className="font-bold text-foreground text-lg mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
