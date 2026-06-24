import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '~platform/providers'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root not found')

createRoot(container).render(
  <StrictMode>
    <Providers />
  </StrictMode>
)
