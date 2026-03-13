// src/views/SettingsView.jsx
import React, { useState } from 'react';

// 1. On ajoute la fonction onLogout en paramètre
const SettingsView = ({ onLogout }) => {
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState(true);
  
  const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark-mode'));

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const handleSave = () => {
    alert("Vos préférences ont été sauvegardées avec succès !");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Paramètres ⚙️</h1>
      <p style={styles.subtitle}>Personnalisez votre expérience Octo'System.</p>

      <div className="settings-card">
        <h3>Préférences d'affichage</h3>
        
        <div className="setting-item">
          <div className="setting-info">
            <h4>Langue de l'interface</h4>
            <p>Choisissez votre langue d'affichage.</p>
          </div>
          <select 
            className="custom-select"
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Thème Sombre (Dark Mode)</h4>
            <p>Passez l'interface en couleurs sombres pour reposer vos yeux.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={toggleDarkMode} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <h3 style={{ marginTop: '40px' }}>Système</h3>

        <div className="setting-item">
          <div className="setting-info">
            <h4>Alerte de capacité maximale</h4>
            <p>Recevoir une notification quand la masse totale approche les 40 kg (limite du capteur).</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={() => setNotifications(!notifications)} 
            />
            <span className="slider"></span>
          </label>
        </div>
        
        <button className="save-btn" onClick={handleSave} style={{ marginBottom: '20px' }}>
          Sauvegarder les modifications
        </button>

        {/* 2. ZONE DE DÉCONNEXION RAJOUTÉE ICI */}
        <h3 style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: '#e74c3c' }}>
          Session
        </h3>
        <div className="setting-item" style={{ borderBottom: 'none' }}>
          <div className="setting-info">
            <h4 style={{ color: '#e74c3c' }}>Déconnexion</h4>
            <p>Fermer la session actuelle sur cet appareil.</p>
          </div>
          <button onClick={onLogout} style={styles.dangerButton}>
            <i className="fa-solid fa-right-from-bracket"></i> Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' },
  title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
  subtitle: { color: 'var(--text-muted)', marginBottom: '30px' },
  // 3. Style ajouté spécifiquement pour le bouton de déconnexion
  dangerButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  }
};

export default SettingsView;