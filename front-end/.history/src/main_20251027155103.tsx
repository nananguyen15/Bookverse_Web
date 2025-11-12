import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// !!! THAY THẾ BẰNG CLIENT ID CỦA BẠN !!!
const googleClientId = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
