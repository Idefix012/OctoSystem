// src/App.jsx
import React from 'react';
import './App.css';

// Import du Contrôleur
import { useLayoutController } from './controllers/useLayoutController';

// Import des Vues
import HeaderView from './views/HeaderView';
import SidebarView from './views/SidebarView';

function App() {
  const { isSidebarOpen, toggleMenu, closeMenu, menuItems } = useLayoutController();

  return (
    <div className="app-container">
      
      {/* 1. La Sidebar en premier (pour qu'elle soit fixée à gauche sur PC) */}
      <SidebarView 
        isOpen={isSidebarOpen} 
        onClose={closeMenu} 
        menuItems={menuItems} 
      />

      {/* 2. Le conteneur de droite (Header + Contenu) */}
      <div className="main-content">
        <HeaderView onToggleMenu={toggleMenu} />
        
        <main style={{ padding: '20px' }}>
          <h1>Architecture MVC</h1>
          <p>Les données viennent du Modèle, la logique du Contrôleur, et l'affichage des Vues.</p>
        </main>
      </div>

    </div>
  );
}

export default App;