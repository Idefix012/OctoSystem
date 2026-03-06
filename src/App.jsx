// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { useLayoutController } from './controllers/useLayoutController';
import HeaderView from './views/HeaderView';
import SidebarView from './views/SidebarView';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import CommunityView from './views/CommunityView';
import SettingsView from './views/SettingsView';

function App() {
  const { isSidebarOpen, toggleMenu, closeMenu, menuItems } = useLayoutController();

  return (
    // 1. On englobe toute l'application dans le composant Router
    <Router>
      <div className="app-container">
        
        <SidebarView isOpen={isSidebarOpen} onClose={closeMenu} menuItems={menuItems} />

        <div className="main-content">
          <HeaderView onToggleMenu={toggleMenu} />
          
          <main>
            {/* 2. C'est ici que le contenu change dynamiquement selon l'URL */}
            <Routes>
              <Route path="/" element={<DashboardView />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="/community" element={<CommunityView />} />
              
              {/* 2. LA NOUVELLE PAGE PARAMÈTRES */}
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default App;