import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppProvider } from '@/context/AppContext';
import './index.css';

// AuthProvider (who is signed in) + LanguageProvider (active locale) sit above
// GrantPilotProvider (application data), all above the Router — so none is
// recreated on route changes and language/auth never reset during navigation.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <AppProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
);
