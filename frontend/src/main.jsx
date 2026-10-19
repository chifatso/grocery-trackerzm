import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap-icons/font/bootstrap-icons.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
console.log("Google Client ID loaded:", Boolean(googleClientId));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />

    </GoogleOAuthProvider>
    
  </StrictMode>,
);
