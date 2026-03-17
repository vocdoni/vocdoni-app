import { usePageContext } from 'vike-react/usePageContext'

const ErrorPage = () => {
  const pageContext = usePageContext()
  const statusCode = pageContext.abortStatusCode || 500
  const errorMessage =
    pageContext.abortReason instanceof Error
      ? pageContext.abortReason.message
      : typeof pageContext.abortReason === 'string'
        ? pageContext.abortReason
        : 'Unexpected application error.'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '42rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>{statusCode}</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Something went wrong</h1>
        <p style={{ color: '#4a5568', margin: '0 auto 1rem' }}>{errorMessage}</p>
        <a href='/' style={{ color: '#1a365d', fontWeight: 600 }}>
          Go to home
        </a>
      </div>
    </main>
  )
}

export default ErrorPage
