import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disable Google Translate / browser translation DOM mutations
document.documentElement.setAttribute('translate', 'no')

const meta = document.createElement('meta')
meta.name = 'google'
meta.content = 'notranslate'
document.head.appendChild(meta)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
