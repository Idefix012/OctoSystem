// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { useLayoutController } from './controllers/useLayoutController';
import HeaderView from './views/HeaderView';
import SidebarView from './views/SidebarView';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import CommunityView from './views/CommunityView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';

function App() {
  const { isSidebarOpen, toggleMenu, closeMenu, menuItems } = useLayoutController();
  
  // L'état qui mémorise toutes les infos de l'utilisateur une fois connecté
  const [currentUser, setCurrentUser] = useState(null);

  // Si l'utilisateur n'est pas connecté, on le bloque sur la page de Login
  if (!currentUser) {
    return <LoginView onLoginSuccess={(userData) => setCurrentUser(userData)} />;
  }

  // S'il EST connecté, on affiche l'application complète
  return (
    <Router>
      <div className="app-container">
        
        <SidebarView isOpen={isSidebarOpen} onClose={closeMenu} menuItems={menuItems} />

        <div className="main-content">
          <HeaderView onToggleMenu={toggleMenu} />
          
          <main>
            <Routes>
              {/* On passe les données de l'utilisateur au Dashboard via une "prop" */}
              <Route path="/" element={<DashboardView user={currentUser} />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="/community" element={<CommunityView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default App;