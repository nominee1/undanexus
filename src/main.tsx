import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { applyTenantTheme, getTenantConfig } from './config/tenant';

const tenant = getTenantConfig();
applyTenantTheme(tenant.themeColor);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
