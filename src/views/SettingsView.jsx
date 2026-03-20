// src/views/SettingsView.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Import de la fonction toast

const SettingsView = ({ onLogout, user }) => {
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [nom, setNom] = useState(user?.nom || '');
  const [email, setEmail] = useState(user?.mail || '');
  
  const [communeSearch, setCommuneSearch] = useState('');
  const [communeList, setCommuneList] = useState([]);

  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmerMdp, setConfirmerMdp] = useState('');

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

  const handleCopyCode = () => {
    const code = user?.friend_code || "XXXX-XXXX";
    navigator.clipboard.writeText(code);
    toast.info(`Code ami ${code} copié !`); // Remplacé
  };

  const handleRechercheCommune = async (texte) => {
    setCommuneSearch(texte);
    if (texte.length < 2) {
      setCommuneList([]);
      return;
    }
    try {
      const response = await fetch(`http://192.168.1.143:5000/recherche_commune?q=${texte}`);
      if (response.ok) {
        const data = await response.json();
        setCommuneList(data);
      }
    } catch (error) {
      console.error("Erreur recherche commune :", error);
    }
  };

  const handleSelectCommune = (nomCommune) => {
    setCommuneSearch(nomCommune);
    setCommuneList([]); 
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      const payload = { prenom: prenom, nom: nom, mail: email };
      if (communeSearch.trim() !== '') {
        payload.commune = communeSearch.trim();
      }

      const response = await fetch(`http://192.168.1.143:5000/utilisateur/modifier`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Profil mis à jour ! Reconnectez-vous pour voir les changements."); // Remplacé
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`); // Remplacé
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      toast.error("Impossible de joindre le serveur."); // Remplacé
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!ancienMdp || !nouveauMdp || !confirmerMdp) {
      toast.warning("Veuillez remplir tous les champs de mot de passe."); // Remplacé
      return;
    }
    if (nouveauMdp !== confirmerMdp) {
      toast.error("Les nouveaux mots de passe ne correspondent pas !"); // Remplacé
      return;
    }
    if (nouveauMdp.length < 6) {
      toast.warning("Le mot de passe doit faire au moins 6 caractères."); // Remplacé
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      const response = await fetch(`http://192.168.1.143:5000/utilisateur/mot_de_passe`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ancien_mdp: ancienMdp, nouveau_mdp: nouveauMdp })
      });

      if (response.ok) {
        toast.success("Mot de passe mis à jour avec succès !"); // Remplacé
        setAncienMdp('');
        setNouveauMdp('');
        setConfirmerMdp('');
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`); // Remplacé
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      toast.error("Impossible de joindre le serveur."); // Remplacé
    }
  };

  const handleSaveSettings = () => {
    toast.success("Vos préférences ont été sauvegardées !"); // Remplacé
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Paramètres ⚙️</h1>
      <p style={styles.subtitle}>Gérez votre compte et personnalisez votre expérience.</p>

      {/* SECTION 1 : MON PROFIL */}
      <div className="settings-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ color: 'var(--primary)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          <i className="fa-regular fa-id-card"></i> Mon Profil
        </h3>
        
        <div style={styles.codeBox}>
          <div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Votre Code Ami</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '2px', fontFamily: 'monospace' }}>
              {user?.friend_code || "XXXX-XXXX"}
            </div>
          </div>
          <button onClick={handleCopyCode} style={styles.copyBtn}>
            <i className="fa-regular fa-copy"></i> Copier
          </button>
        </div>

        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Prénom</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Adresse Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          </div>

          <div style={{...styles.inputGroup, position: 'relative'}}>
            <label style={styles.label}>
              Commune actuelle : <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.nom_commune || "Non renseignée"}</span>
            </label>
            <input 
              type="text" 
              placeholder="Tapez ici pour changer de commune..."
              value={communeSearch} 
              onChange={(e) => handleRechercheCommune(e.target.value)} 
              style={styles.input} 
            />
            {communeList.length > 0 && (
              <ul style={styles.autocompleteList}>
                {communeList.map((c) => (
                  <li key={c.id_commune} style={styles.autocompleteItem} onClick={() => handleSelectCommune(c.nom)}>
                    {c.nom}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button onClick={handleSaveProfile} style={styles.primaryBtn}>
          <i className="fa-solid fa-floppy-disk"></i> Mettre à jour mon profil
        </button>
      </div>

      {/* SECTION 2 : SÉCURITÉ */}
      <div className="settings-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#f39c12', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          <i className="fa-solid fa-lock"></i> Sécurité
        </h3>
        <div style={styles.formGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ancien mot de passe</label>
            <input type="password" placeholder="••••••••" value={ancienMdp} onChange={(e) => setAncienMdp(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}></div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nouveau mot de passe</label>
            <input type="password" placeholder="••••••••" value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmer le nouveau mot de passe</label>
            <input type="password" placeholder="••••••••" value={confirmerMdp} onChange={(e) => setConfirmerMdp(e.target.value)} style={styles.input} />
          </div>
        </div>
        <button onClick={handleUpdatePassword} style={styles.warningBtn}>
          Modifier le mot de passe
        </button>
      </div>

      {/* SECTION 3 : PRÉFÉRENCES */}
      <div className="settings-card">
        <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Préférences d'affichage</h3>
        <div className="setting-item">
          <div className="setting-info">
            <h4>Thème Sombre (Dark Mode)</h4>
            <p>Passez l'interface en couleurs sombres pour reposer vos yeux.</p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
            <span className="slider"></span>
          </label>
        </div>

        {/* SECTION 4 : DÉCONNEXION */}
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
  codeBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', border: '1px dashed var(--primary)' },
  copyBtn: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem', fontFamily: 'inherit' },
  autocompleteList: { position: 'absolute', top: '75px', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  autocompleteItem: { padding: '10px 15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-main)' },
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  warningBtn: { background: '#f39c12', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  dangerButton: { display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }
};

export default SettingsView;