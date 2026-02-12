// src/App.jsx
import React from 'react';
import './App.css';

// Import du Contrôleur
import { useLayoutController } from './controllers/useLayoutController';

// Import des Vues
import HeaderView from './views/HeaderView';
import SidebarView from './views/SidebarView';

function App() {
  // 1. Appel du Contrôleur (on récupère logique + données)
  const { isSidebarOpen, toggleMenu, closeMenu, menuItems } = useLayoutController();

  return (
    <div className="app-container">
      
      {/* 2. Injection dans les Vues */}
      <HeaderView onToggleMenu={toggleMenu} />
      
      <SidebarView 
        isOpen={isSidebarOpen} 
        onClose={closeMenu} 
        menuItems={menuItems} 
      />

      {/* Contenu Principal */}
      <main style={{ padding: '20px' }}>
        <h1>Architecture MVC</h1>
        <p>Les données viennent du Modèle, la logique du Contrôleur, et l'affichage des Vues.</p>
      </main>
    </div>
  );
}

export default App;