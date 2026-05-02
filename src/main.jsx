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
                background:   'hsl(var(--card))',
                color:        'hsl(var(--card-foreground))',
                border:       '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize:     '14px',
              },
              success: {
                iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--card))' },
              },
              error: {
                iconTheme: { primary: 'hsl(var(--destructive))', secondary: 'hsl(var(--card))' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
