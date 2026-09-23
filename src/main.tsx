import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { RoleProvider } from './context/RoleContext'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import AppErrorBoundary from './components/AppErrorBoundary'
import { ShuttleSelectionProvider } from './context/ShuttleSelectionContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <RoleProvider>
            <AppProvider>
              <ShuttleSelectionProvider>
                <App />
              </ShuttleSelectionProvider>
            </AppProvider>
          </RoleProvider>
        </ToastProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>,
)
