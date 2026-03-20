// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// --- Imports pour les Toasts ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('octo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('octo_user');
    localStorage.removeItem('octo_token');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(userData) => setCurrentUser(userData)} />;
  }

  return (
    <Router>
      <div className="app-container">
        
        {/* LE CONTENEUR DES NOTIFICATIONS */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          theme="colored"
        />

        <SidebarView 
          isOpen={isSidebarOpen} 
          onClose={closeMenu} 
          menuItems={menuItems} 
        />

        <div className="main-content">
          <HeaderView onToggleMenu={toggleMenu} user={currentUser} />
          
          <main>
            <Routes>
              <Route path="/" element={<DashboardView user={currentUser} />} />
              <Route path="/history" element={<HistoryView />} />
              <Route path="/community" element={<CommunityView user={currentUser} />} />
              <Route path="/settings" element={<SettingsView onLogout={handleLogout} user={currentUser} />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

export default App;