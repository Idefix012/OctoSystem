// src/App.jsx
import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

function App() {
  // État pour gérer l'ouverture du menu (false = fermé par défaut)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fonctions pour ouvrir/fermer
  const toggleMenu = () => setIsSidebarOpen(!isSidebarOpen);
  const closeMenu = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      
      {/* 1. La Barre du haut (Burger + Titre) */}
      <Header onToggleMenu={toggleMenu} />

      {/* 2. Le Menu Latéral (Caché ou visible selon le state) */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeMenu} />

      {/* 3. Le Contenu Principal */}
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* C'est ici qu'on mettra tes widgets plus tard */}
        <h1>Tableau de bord</h1>
        <p>Bienvenue Evan. La structure est prête !</p>
        
        <div style={{ 
            marginTop: '20px', 
            padding: '20px', 
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
            <p>🚧 Zone des graphiques (Chart.js) à venir...</p>
        </div>

      </main>
    </div>
  )
}

export default App