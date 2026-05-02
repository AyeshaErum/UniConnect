import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#122657',
                color:      '#fff',
                border:     '1px solid #1e3a73',
                borderRadius: '12px',
                fontSize:   '14px',
              },
              success: {
                iconTheme: { primary: '#00ccc4', secondary: '#0a1830' },
              },
              error: {
                iconTheme: { primary: '#ff6b6b', secondary: '#0a1830' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
