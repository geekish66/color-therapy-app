import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PayPalScriptProvider } from "@paypal/react-paypal-js"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PayPalScriptProvider options={{ clientId: (import.meta as any).env.VITE_PAYPAL_CLIENT_ID, currency: "USD" }}>
      <App />
    </PayPalScriptProvider>
  </StrictMode>,
)
