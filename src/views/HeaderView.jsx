// src/views/HeaderView.jsx
import React from 'react';
// Importation du hook permettant la navigation programmatique au sein de la Single Page Application (SPA)
import { useNavigate } from 'react-router-dom'; 

/**
 * Composant HeaderView
 * Composant d'interface (Vue) représentant l'en-tête (Top Bar) de l'application.
 * Il contient le bouton de menu burger (pour le responsive), le titre global,
 * et l'avatar de l'utilisateur permettant un accès rapide au profil.
 */
const HeaderView = ({ onToggleMenu, user }) => {
  // Initialisation de l'instance de navigation
  const navigate = useNavigate(); 
  
  // LOGIQUE SÉCURISÉE : Extraction des initiales de l'utilisateur avec programmation défensive.
  // On s'assure que l'objet 'user' et ses propriétés existent avant de manipuler les chaînes de caractères (charAt).
  // Cela prévient les erreurs de type "TypeError: Cannot read properties of undefined" lors du premier rendu.
  const initials = (user && user.first_name && user.last_name)
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() 
    : '👤'; // Fallback (valeur par défaut) si les données ne sont pas encore disponibles

  // Sécurisation du titre au survol de la souris
  // Construction dynamique de la valeur de l'attribut HTML 'title' pour l'accessibilité et l'UX
  const titleName = (user && user.first_name && user.last_name) 
    ? `${user.first_name} ${user.last_name}` 
    : 'Profil';

  /**
   * Gestionnaire d'événement déclenchant la redirection vers la route des paramètres
   */
  const goToProfile = () => {
    navigate('/settings'); 
  };

  return (
    <header style={styles.header}>
      {/* Élément interactif déclenchant la fonction (passée en prop) contrôlant l'état d'ouverture de la barre latérale */}
      <div className="burger-menu" onClick={onToggleMenu}>
        <i className="fa-solid fa-bars"></i>
      </div>
      
      <h2 style={styles.title}>Octo'System</h2>
      
      {/* Conteneur de l'avatar affichant les initiales calculées, avec info-bulle native (title) et événement de clic */}
      <div style={styles.avatar} title={titleName} onClick={goToProfile}>
        {initials}
      </div>
    </header>
  );
};

// Dictionnaire des styles CSS-in-JS pour la mise en page de l'en-tête
const styles = {
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '1rem', 
    background: 'var(--bg-card)', 
    alignItems: 'center', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
  },
  title: { 
    color: 'var(--primary)', 
    margin: 0 
  },
  avatar: { 
    width: 35, 
    height: 35, 
    background: 'var(--dark)', 
    color: 'white', 
    borderRadius: '50%', 
    display: 'grid', 
    placeItems: 'center', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out' 
  }
};

export default HeaderView;