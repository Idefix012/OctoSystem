// src/views/HeaderView.jsx
import React from 'react';

const HeaderView = ({ onToggleMenu }) => {
  return (
    <header style={styles.header}>
      {/* La classe burger-menu est cruciale ici */}
      <div className="burger-menu" onClick={onToggleMenu}>
        <i className="fa-solid fa-bars"></i>
      </div>
      <h2 style={styles.title}>Octo'System</h2>
      <div style={styles.avatar}>EO</div>
    </header>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-card)', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  title: { color: '#4CAF50', margin: 0 },
  avatar: { width: 35, height: 35, background: '#2C3E50', color: 'white', borderRadius: '50%', display: 'grid', placeItems: 'center' }
};

export default HeaderView;