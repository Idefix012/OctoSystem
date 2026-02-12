// src/components/Header.jsx
import React from 'react';

function Header({ onToggleMenu }) {
  return (
    <header style={styles.header}>
      {/* Le Bouton Burger */}
      <div onClick={onToggleMenu} style={styles.burger}>
        <i className="fa-solid fa-bars"></i>
      </div>

      {/* Le Titre / Logo */}
      <h2 style={styles.title}>Octo'System</h2>

      {/* Avatar utilisateur (optionnel pour l'instant) */}
      <div style={styles.avatar}>OE</div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: 'var(--white)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  burger: {
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--dark)'
  },
  title: {
    color: 'var(--primary)',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  avatar: {
    width: '35px',
    height: '35px',
    backgroundColor: 'var(--dark)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem'
  }
};

export default Header;