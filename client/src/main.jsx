import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools' 
import { queryClient } from './lib/react-query'
import { AuthProvider } from './context/AuthContext'

import "./index.css"
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
       <HelmetProvider>
         <AuthProvider>
          <App />
        </AuthProvider>
       </HelmetProvider>
      </GoogleOAuthProvider>
       {/* <ReactQueryDevtools/> */}
    </QueryClientProvider>
  </StrictMode>,
)