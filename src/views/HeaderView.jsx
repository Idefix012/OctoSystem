import React from 'react';

const HeaderView = ({ onToggleMenu }) => {
  return (
    <header style={styles.header}>
      <div onClick={onToggleMenu} style={styles.burger}>
        <i className="fa-solid fa-bars"></i>
      </div>
      <h2 style={styles.title}>Octo'System</h2>
      <div style={styles.avatar}>EO</div>
    </header>
  );
};

// ... (Garde le même style CSS que tout à l'heure, je ne le remets pas pour raccourcir)
const styles = {
  header: { display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'white', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  burger: { fontSize: '1.5rem', cursor: 'pointer' },
  title: { color: '#4CAF50', margin: 0 },
  avatar: { width: 35, height: 35, background: '#2C3E50', color: 'white', borderRadius: '50%', display: 'grid', placeItems: 'center' }
};

export default HeaderView;