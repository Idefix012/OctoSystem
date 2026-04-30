// src/views/SettingsView.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify'; 

const SettingsView = ({ onLogout, user }) => {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [householdSize, setHouseholdSize] = useState(user?.household_size || 1);
  
  const [citySearch, setCitySearch] = useState('');
  const [cityList, setCityList] = useState([]);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newDeveui, setNewDeveui] = useState('');

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('octo_theme') === 'dark';
  });
  
  // CORRECTION : Initialisation intelligente du consentement RGPD
  const [isPubliclyShared, setIsPubliclyShared] = useState(() => {
    // 1. On vérifie s'il y a une sauvegarde locale forcée pour cet utilisateur précis
    const saved = localStorage.getItem(`octo_rgpd_${user?.id_user}`);
    if (saved !== null) return saved === 'true';
    
    // 2. Sinon on prend la valeur de la base de données (gère les true/false et les 1/0 de MySQL)
    return user?.is_public === 1 || user?.is_public === true;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('octo_theme', 'dark'); 
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('octo_theme', 'light'); 
    }
  };

  const handleCopyCode = () => {
    const code = user?.friend_code || "XXXX-XXXX";
    navigator.clipboard.writeText(code);
    toast.info(`Code ami ${code} copié !`); 
  };

  const handleSearchCity = async (text) => {
    setCitySearch(text);
    if (text.length < 2) {
      setCityList([]);
      return;
    }
    try {
      const response = await fetch(`http://192.168.1.143:5000/search_city?q=${encodeURIComponent(text)}`);
      if (response.ok) {
        const data = await response.json();
        setCityList(data);
      }
    } catch (error) {
      console.error("Erreur recherche commune :", error);
    }
  };

  const handleSelectCity = (cityName) => {
    setCitySearch(cityName);
    setCityList([]); 
  };

  const handleSaveProfile = async () => {
    if (householdSize < 1) {
      toast.warning("Le foyer doit compter au moins 1 personne.");
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      const payload = { 
        first_name: firstName, 
        last_name: lastName, 
        email: email,
        household_size: parseInt(householdSize, 10)
      };
      
      if (citySearch.trim() !== '') {
        payload.city_name = citySearch.trim();
      }

      const response = await fetch(`http://192.168.1.143:5000/user/edit`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Profil mis à jour ! Reconnectez-vous pour voir les changements."); 
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`); 
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      toast.error("Impossible de joindre le serveur."); 
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warning("Veuillez remplir tous les champs de mot de passe."); 
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas !"); 
      return;
    }
    if (newPassword.length < 6) {
      toast.warning("Le mot de passe doit faire au moins 6 caractères."); 
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      const response = await fetch(`http://192.168.1.143:5000/user/password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          old_password: oldPassword, 
          new_password: newPassword 
        })
      });

      if (response.ok) {
        toast.success("Mot de passe mis à jour avec succès !"); 
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`); 
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      toast.error("Impossible de joindre le serveur."); 
    }
  };

  const handleAddGarbage = async (e) => {
    e.preventDefault();
    if (!newDeveui || newDeveui.trim().length < 5) {
      toast.warning("Veuillez entrer un DevEUI valide.");
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      const response = await fetch(`http://192.168.1.143:5000/garbage/add`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deveui: newDeveui.trim() })
      });

      if (response.ok) {
        toast.success("Super ! Votre nouvelle poubelle est synchronisée.");
        setNewDeveui(''); 
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur réseau IoT :", err);
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("ÊTES-VOUS SÛR(E) ?\n\nCette action est totalement irréversible. Toutes vos données personnelles, vos statistiques, vos capteurs et votre réseau d'amis seront supprimés définitivement.")) {
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      const response = await fetch(`http://192.168.1.143:5000/user/delete`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Votre compte a été supprimé. À bientôt !");
        setTimeout(() => {
          onLogout();
        }, 1500);
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur suppression compte :", err);
      toast.error("Impossible de joindre le serveur.");
    }
  };

  // CORRECTION : Forçage de la sauvegarde locale du choix RGPD
  const handleTogglePublicShare = async () => {
    const newValue = !isPubliclyShared;
    setIsPubliclyShared(newValue); 

    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/users/preferences`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ is_public: newValue })
      });

      if (response.ok) {
        if (user) {
          user.is_public = newValue;
        }
        // C'est cette ligne qui garantit que le bouton survivra aux changements de page
        localStorage.setItem(`octo_rgpd_${user?.id_user}`, newValue);
        
        toast.success(newValue ? "Données partagées avec la ville (Anonymisées) !" : "Partage public désactivé.");
      } else {
        throw new Error("Erreur serveur");
      }
    } catch (err) {
      setIsPubliclyShared(!newValue); 
      toast.error("Impossible de sauvegarder vos préférences RGPD.");
    }
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
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nom</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Adresse Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} title="Permet de rendre le classement communautaire équitable">
              Personnes au foyer <i className="fa-solid fa-circle-info" style={{color: 'var(--primary)'}}></i>
            </label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={householdSize} 
              onChange={(e) => setHouseholdSize(e.target.value)} 
              style={styles.input} 
            />
          </div>

          <div style={{...styles.inputGroup, position: 'relative', gridColumn: '1 / -1'}}>
            <label style={styles.label}>
              Commune actuelle : <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{user?.city_name || "Non renseignée"}</span>
            </label>
            <input 
              type="text" 
              placeholder="Tapez ici pour changer de commune..."
              value={citySearch} 
              onChange={(e) => handleSearchCity(e.target.value)} 
              style={styles.input} 
            />
            {cityList.length > 0 && (
              <ul style={styles.autocompleteList}>
                {cityList.map((c) => (
                  <li key={c.id_city} style={styles.autocompleteItem} onClick={() => handleSelectCity(c.city_name)}>
                    {c.city_name}
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
          
          {/* ANCIEN MOT DE PASSE */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ancien mot de passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showOldPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                style={{ ...styles.input, paddingRight: '40px', width: '100%', boxSizing: 'border-box' }} 
              />
              <i 
                className={`fa-solid ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer' }}
              ></i>
            </div>
          </div>
          
          <div style={styles.inputGroup}></div>
          
          {/* NOUVEAU MOT DE PASSE */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nouveau mot de passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showNewPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={{ ...styles.input, paddingRight: '40px', width: '100%', boxSizing: 'border-box' }} 
              />
              <i 
                className={`fa-solid ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer' }}
              ></i>
            </div>
          </div>
          
          {/* CONFIRMATION DU NOUVEAU MOT DE PASSE */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmer le nouveau mot de passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={{ ...styles.input, paddingRight: '40px', width: '100%', boxSizing: 'border-box' }} 
              />
              <i 
                className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer' }}
              ></i>
            </div>
          </div>

        </div>
        <button onClick={handleUpdatePassword} style={styles.warningBtn}>
          Modifier le mot de passe
        </button>
      </div>

      {/* SECTION 3 : MATÉRIEL IOT */}
      <div className="settings-card" style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#2ecc71', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
          <i className="fa-solid fa-microchip"></i> Mes Capteurs (IoT)
        </h3>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '15px' }}>
          Associez une nouvelle poubelle connectée OctoSystem à votre foyer en saisissant son numéro de série unique (DevEUI) situé sous le couvercle.
        </p>

        <form onSubmit={handleAddGarbage} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ ...styles.inputGroup, flex: '1 1 250px' }}>
            <label style={styles.label}>Numéro de série (DevEUI)</label>
            <input 
              type="text" 
              placeholder="Ex: A1B2-C3D4-E5F6" 
              value={newDeveui} 
              onChange={(e) => setNewDeveui(e.target.value.toUpperCase())} 
              style={{...styles.input, fontFamily: 'monospace', letterSpacing: '1px'}} 
            />
          </div>
          <button type="submit" style={{ ...styles.primaryBtn, width: 'auto', backgroundColor: '#2ecc71' }}>
            <i className="fa-solid fa-link"></i> Lier la poubelle
          </button>
        </form>
      </div>

      {/* SECTION 4 : PRÉFÉRENCES ET CONFIDENTIALITÉ */}
      <div className="settings-card" style={{ marginBottom: '30px' }}>
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

        {/* Bloc Confidentialité (RGPD) */}
        <h3 style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: '#3498db' }}>
          Confidentialité (RGPD)
        </h3>
        <div className="setting-item" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div className="setting-info" style={{ flex: '1 1 300px' }}>
            <h4 style={{ color: '#3498db' }}>Classement de la Ville (Octo'Community)</h4>
            <p>
              En activant cette option (Opt-in), vous acceptez que le poids de vos déchets (anonymisé avec la première lettre de votre nom) apparaisse dans le classement public de la ville.
            </p>
          </div>
          <label className="switch">
            <input type="checkbox" checked={isPubliclyShared} onChange={handleTogglePublicShare} />
            <span className="slider"></span>
          </label>
        </div>

        <h3 style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', color: '#f39c12' }}>
          Session
        </h3>
        <div className="setting-item" style={{ borderBottom: 'none', marginBottom: '0' }}>
          <div className="setting-info">
            <h4 style={{ color: '#f39c12' }}>Déconnexion</h4>
            <p>Fermer la session actuelle sur cet appareil.</p>
          </div>
          <button onClick={onLogout} style={{ ...styles.warningBtn, width: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-right-from-bracket"></i> Se déconnecter
          </button>
        </div>
      </div>

      {/* SECTION 5 : ZONE DE DANGER (RGPD) */}
      <div className="settings-card" style={{ border: '2px dashed #e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.05)' }}>
        <h3 style={{ color: '#e74c3c', borderBottom: '2px solid rgba(231, 76, 60, 0.2)', paddingBottom: '10px' }}>
          <i className="fa-solid fa-triangle-exclamation"></i> Zone de Danger
        </h3>
        <div className="setting-item" style={{ borderBottom: 'none', marginBottom: '0', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div className="setting-info" style={{ flex: '1 1 300px' }}>
            <h4 style={{ color: '#e74c3c' }}>Suppression du compte (RGPD)</h4>
            <p>
              La suppression de votre compte est irréversible. Toutes vos données personnelles, vos statistiques, vos capteurs et votre réseau d'amis seront définitivement effacés de nos serveurs.
            </p>
          </div>
          <button onClick={handleDeleteAccount} style={{ ...styles.dangerButton, width: 'auto' }}>
            <i className="fa-solid fa-user-xmark"></i> Supprimer définitivement
          </button>
        </div>
      </div>

    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '50px' },
  title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
  subtitle: { color: 'var(--text-muted)', marginBottom: '30px' },
  codeBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', border: '1px dashed var(--primary)' },
  copyBtn: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem', fontFamily: 'inherit' },
  autocompleteList: { position: 'absolute', top: '75px', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  autocompleteItem: { padding: '10px 15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-main)' },
  primaryBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  warningBtn: { background: '#f39c12', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  dangerButton: { display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }
};

export default SettingsView;