// src/views/SettingsView.jsx
import React, { useState } from 'react';

const SettingsView = () => {
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState(true);
  
  // 1. On vérifie si le mode sombre est déjà activé
  const [darkMode, setDarkMode] = useState(document.body.classList.contains('dark-mode'));

  // 2. La fonction qui fait la bascule
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // On ajoute ou on retire la classe sur le body du site
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
            {/* 3. On utilise notre nouvelle fonction ici */}
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
        
        <button className="save-btn" onClick={handleSave}>
          Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
};

// 4. On utilise les variables CSS au lieu du gris et noir en dur
const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' },
  title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
  subtitle: { color: 'var(--text-muted)', marginBottom: '30px' }
};

export default SettingsView;