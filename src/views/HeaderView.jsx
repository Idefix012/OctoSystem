// src/views/HeaderView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. On importe le système de navigation

const HeaderView = ({ onToggleMenu, user }) => {
  const navigate = useNavigate(); // 2. On initialise la fonction de navigation
  
  // LOGIQUE SÉCURISÉE : 
  const initials = (user && user.prenom && user.nom)
    ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase() 
    : '👤';

  // Sécurisation du titre au survol de la souris
  const titleName = (user && user.prenom && user.nom) 
    ? `${user.prenom} ${user.nom}` 
    : 'Profil';

  // 3. Fonction qui se déclenche au clic sur l'avatar
  const goToProfile = () => {
    navigate('/settings'); // Redirige vers ta route des paramètres
  };

  return (
    <header style={styles.header}>
      <div className="burger-menu" onClick={onToggleMenu}>
        <i className="fa-solid fa-bars"></i>
      </div>
      
      <h2 style={styles.title}>Octo'System</h2>
      
      {/* 4. On ajoute le onClick sur la div de l'avatar */}
      <div style={styles.avatar} title={titleName} onClick={goToProfile}>
        {initials}
      </div>
    </header>
  );
};

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
    transition: 'transform 0.2s ease-in-out' // Petit bonus : animation au survol possible en CSS
  }
};

export default HeaderView;