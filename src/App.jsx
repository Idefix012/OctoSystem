// src/App.jsx
import React, { useEffect, useState } from 'react';
// Importation des composants fondamentaux de React Router pour la navigation SPA (Single Page Application)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Importation du conteneur global pour le système de notifications (Toasts)
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importation du contrôleur personnalisé (Custom Hook) gérant la logique d'état de l'interface globale
import { useLayoutController } from './controllers/useLayoutController';

// Importation des différentes vues (Vues partielles et Vues complètes)
import HeaderView from './views/HeaderView';
import SidebarView from './views/SidebarView';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import CommunityView from './views/CommunityView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';

/**
 * Composant App (Root Component)
 * Point d'entrée principal de l'application React.
 * Gère l'initialisation de l'environnement (thème), l'état global d'authentification,
 * et le routage conditionnel de haut niveau.
 */
function App() {
  
  // CYCLE DE VIE : Initialisation des préférences d'interface (Thème)
  // Exécuté une seule fois au montage du composant grâce au tableau de dépendances vide []
  useEffect(() => {
    // Vérification du stockage local pour appliquer la classe CSS globale 'dark-mode' au corps du document
    const savedTheme = localStorage.getItem('octo_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);
  
  // Extraction des états et méthodes depuis le contrôleur de layout personnalisé
  const { isSidebarOpen, toggleMenu, closeMenu, menuItems } = useLayoutController();
  
  // ÉTAT GLOBAL : Gestion de l'utilisateur authentifié
  // Utilisation de l'initialisation paresseuse (lazy initialization) pour éviter de lire 
  // le localStorage (opération synchrone bloquante) à chaque rendu du composant.
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('octo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  /**
   * Gestionnaire de déconnexion.
   * Purge les données de session sécurisées du navigateur et réinitialise l'état global,
   * ce qui déclenchera un re-rendu vers l'écran de connexion.
   */
  const handleLogout = () => {
    localStorage.removeItem('octo_user');
    localStorage.removeItem('octo_token');
    setCurrentUser(null);
  };

  /**
   * NOUVEAU : Fonction pour forcer la mise à jour globale en temps réel.
   * Permet de propager les modifications du profil (ex: consentement RGPD)
   * à l'ensemble de l'arbre DOM virtuel sans recharger la page.
   * @param {Object} updatedUser - Le nouvel objet utilisateur mis à jour
   */
  const handleUpdateUser = (updatedUser) => {
    localStorage.setItem('octo_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  return (
    <>
      {/* Conteneur global interceptant et affichant les notifications (toast) émises depuis n'importe quel composant */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick pauseOnHover theme="colored" />

      {/* RENDU CONDITIONNEL GLOBAL (Guard Pattern) : 
          Si aucun utilisateur n'est défini en état, on bloque l'accès à l'application et on force l'affichage du LoginView.
          Sinon, on charge le routeur et l'interface applicative. */}
      {!currentUser ? (
        <LoginView onLoginSuccess={(userData) => handleUpdateUser(userData)} />
      ) : (
        <Router>
          <div className="app-container">
            {/* Composant de navigation latérale recevant son état d'ouverture et son modèle de données en props */}
            <SidebarView isOpen={isSidebarOpen} onClose={closeMenu} menuItems={menuItems} />

            <div className="main-content">
              {/* En-tête global recevant la méthode d'ouverture du menu et les données de l'utilisateur */}
              <HeaderView onToggleMenu={toggleMenu} user={currentUser} />
              
              <main>
                {/* Définition des routes de l'application (Mappage URL <-> Composant) */}
                <Routes>
                  {/* Passage du contexte utilisateur courant (Prop Drilling) aux vues qui en nécessitent */}
                  <Route path="/" element={<DashboardView user={currentUser} />} />
                  <Route path="/history" element={<HistoryView />} />
                  <Route path="/community" element={<CommunityView user={currentUser} />} />
                  
                  {/* CORRECTION : On passe 'onUpdateUser' aux paramètres ! 
                      Cela permet à SettingsView de déclencher une mise à jour d'état qui remontera jusqu'ici. */}
                  <Route path="/settings" element={
                    <SettingsView onLogout={handleLogout} user={currentUser} onUpdateUser={handleUpdateUser} />
                  } />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      )}
    </>
  );
}

export default App;
