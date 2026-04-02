// src/views/HeaderView.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; 

const HeaderView = ({ onToggleMenu, user }) => {
  const navigate = useNavigate(); 
  
  // LOGIQUE SÉCURISÉE : On utilise désormais first_name et last_name
  const initials = (user && user.first_name && user.last_name)
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() 
    : '👤';

  // Sécurisation du titre au survol de la souris
  const titleName = (user && user.first_name && user.last_name) 
    ? `${user.first_name} ${user.last_name}` 
    : 'Profil';

  const goToProfile = () => {
    navigate('/settings'); 
  };

  return (
    <header style={styles.header}>
      <div className="burger-menu" onClick={onToggleMenu}>
        <i className="fa-solid fa-bars"></i>
      </div>
      
      <h2 style={styles.title}>Octo'System</h2>
      
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
    transition: 'transform 0.2s ease-in-out' 
  }
};

export default HeaderView;