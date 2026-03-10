// src/views/HeaderView.jsx
import React from 'react';

const HeaderView = ({ onToggleMenu, user }) => {
  
  // LOGIQUE SÉCURISÉE : 
  // On vérifie que 'user' existe, ET que 'user.prenom' existe, ET que 'user.nom' existe.
  // Sinon, on met le petit bonhomme par défaut.
  const initials = (user && user.prenom && user.nom)
    ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase() 
    : '👤';

  // Sécurisation du titre au survol de la souris
  const titleName = (user && user.prenom && user.nom) 
    ? `${user.prenom} ${user.nom}` 
    : 'Profil';

  return (
    <header style={styles.header}>
      <div className="burger-menu" onClick={onToggleMenu}>
        <i className="fa-solid fa-bars"></i>
      </div>
      
      <h2 style={styles.title}>Octo'System</h2>
      
      <div style={styles.avatar} title={titleName}>
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
    cursor: 'pointer' 
  }
};

export default HeaderView;