// src/views/SettingsView.jsx
import React, { useState } from 'react';

const SettingsView = () => {
  // Nos états pour mémoriser les choix de l'utilisateur
  const [language, setLanguage] = useState('fr');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Fonction pour simuler la sauvegarde
  const handleSave = () => {
    alert("Vos préférences ont été sauvegardées avec succès !");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Paramètres ⚙️</h1>
      <p style={styles.subtitle}>Personnalisez votre expérience Octo'System.</p>

      <div className="settings-card">
        <h3>Préférences d'affichage</h3>
        
        {/* Ligne 1 : Langue */}
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

        {/* Ligne 2 : Thème Sombre */}
        <div className="setting-item">
          <div className="setting-info">
            <h4>Thème Sombre (Dark Mode)</h4>
            <p>Passez l'interface en couleurs sombres pour reposer vos yeux.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={darkMode} 
              onChange={() => setDarkMode(!darkMode)} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <h3 style={{ marginTop: '40px' }}>Système</h3>

        {/* Ligne 3 : Notifications (Celui que tu voulais garder) */}
        <div className="setting-item">
          <div className="setting-info">
            <h4>Alerte de remplissage</h4>
            <p>Recevoir une notification quand la poubelle est pleine à 90%.</p>
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
        
        <button className="save-btn" onClick={handleSave}>
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' },
  title: { fontSize: '1.8rem', color: '#2C3E50', marginBottom: '5px' },
  subtitle: { color: '#888', marginBottom: '30px' }
};

export default SettingsView;