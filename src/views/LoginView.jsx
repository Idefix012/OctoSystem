// src/views/LoginView.jsx
import React, { useState, useEffect } from 'react';

const LoginView = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  
  // États pour la recherche de commune
  const [searchCommune, setSearchCommune] = useState(''); 
  const [communeResults, setCommuneResults] = useState([]); 
  const [isSearchingCommune, setIsSearchingCommune] = useState(false); 
  const [showDropdown, setShowDropdown] = useState(false); 
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // MINUTEUR (DEBOUNCE) POUR RECHERCHE COMMUNE
  // ==========================================
  useEffect(() => {
    if (!searchCommune || searchCommune.trim().length < 2) {
      setCommuneResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingCommune(true);
      try {
        const response = await fetch(`http://192.168.1.143:5000/recherche_commune?q=${encodeURIComponent(searchCommune)}`);
        
        if (response.ok) {
          const data = await response.json();
          setCommuneResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Erreur recherche commune :", err);
      } finally {
        setIsSearchingCommune(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchCommune]);

  // ==========================================
  // SÉLECTION D'UNE COMMUNE DANS LA LISTE
  // ==========================================
  const handleSelectCommune = (commune) => {
    // L'API d'Evan renvoie "nom" et "id_commune"
    const nomVille = commune.nom || commune.nom_commune || "Ville inconnue";
    
    setSearchCommune(nomVille); 
    setShowDropdown(false); 
    setCommuneResults([]);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setNom('');
    setPrenom('');
    setSearchCommune('');
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLoginMode) {
        // ==========================================
        // MODE CONNEXION
        // ==========================================
        const response = await fetch('http://192.168.1.143:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, mot_de_passe: password })
        });
        
        if (response.ok) {
          const rawData = await response.json();
          // L'API d'Evan renvoie : { donnees: {...}, token: "..." }
          const userData = rawData.donnees;
          
          // Optionnel pour plus tard : stocker le token
          // localStorage.setItem('token', rawData.token);
          localStorage.setItem('octo_user', JSON.stringify(userData));
          localStorage.setItem('octo_token', rawData.token);

          onLoginSuccess(userData); 
        } else {
          setError("Identifiants incorrects.");
        }

      } else {
        // ==========================================
        // MODE INSCRIPTION
        // ==========================================
        if (!searchCommune) {
          setError("Veuillez sélectionner une commune.");
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://192.168.1.143:5000/inscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nom: nom.trim(),
            prenom: prenom.trim(),
            email: cleanEmail, 
            mot_de_passe: password,
            // CORRECTION ICI : Evan attend le texte sous la clé 'commune'
            commune: searchCommune.trim() 
          })
        });

        if (response.ok) {
          setSuccessMsg("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
          setTimeout(() => {
            setIsLoginMode(true);
            setSuccessMsg('');
          }, 2000);
        } else {
          // L'API d'Evan peut renvoyer un message d'erreur précis
          const errorData = await response.json();
          setError(errorData.error || "Erreur lors de la création du compte.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau : Impossible de joindre l'API d'Evan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Octo'System</h2>
          <p>{isLoginMode ? "Connexion au panneau de contrôle" : "Création d'un nouveau compte"}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          {successMsg && (
            <div style={{ backgroundColor: '#E8F5E9', color: '#4CAF50', padding: '10px', borderRadius: '8px', border: '1px solid #4CAF50', textAlign: 'center', fontSize: '0.9rem' }}>
              {successMsg}
            </div>
          )}

          {!isLoginMode && (
            <>
              <div className="input-group">
                <label htmlFor="prenom">Prénom</label>
                <input type="text" id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ex: Evan" disabled={isLoading} required />
              </div>
              <div className="input-group">
                <label htmlFor="nom">Nom</label>
                <input type="text" id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Ollivier" disabled={isLoading} required />
              </div>
              
              {/* --- BARRE DE RECHERCHE DE COMMUNE --- */}
              <div className="input-group" style={{ position: 'relative' }}>
                <label htmlFor="searchCommune">Commune de résidence</label>
                <input 
                  type="text" 
                  id="searchCommune"
                  value={searchCommune} 
                  onChange={(e) => setSearchCommune(e.target.value)} 
                  placeholder="Tapez le nom de votre ville..."
                  disabled={isLoading}
                  autoComplete="off"
                  required 
                />

                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontStyle: 'italic' }}>
                  Information: Utilisez des tirets pour les noms composés (ex: Saint Brieuc → Saint-Brieuc).
                </small>
                
                {isSearchingCommune && (
                  <i className="fa-solid fa-spinner fa-spin" style={{ position: 'absolute', right: '15px', top: '40px', color: 'var(--primary)' }}></i>
                )}

                {showDropdown && communeResults.length > 0 && (
                  <ul style={styles.dropdown}>
                    {communeResults.map((commune, index) => (
                      <li 
                        key={index} 
                        style={styles.dropdownItem}
                        onClick={() => handleSelectCommune(commune)}
                      >
                        {/* On affiche le nom tel qu'il est renvoyé par le code Python */}
                        {commune.nom || commune.nom_commune}
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown && communeResults.length === 0 && searchCommune.length >= 2 && !isSearchingCommune && (
                  <ul style={styles.dropdown}>
                    <li style={{ ...styles.dropdownItem, color: 'var(--text-muted)', cursor: 'default' }}>
                      Aucune commune trouvée.
                    </li>
                  </ul>
                )}
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: evan@octosystem.fr" disabled={isLoading} required />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} required />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Traitement...</>
            ) : (
              <>{isLoginMode ? "Se connecter" : "Créer mon compte"} <i className="fa-solid fa-arrow-right"></i></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLoginMode ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}
          </span>
          <button onClick={toggleMode} type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>
            {isLoginMode ? "S'inscrire" : "Se connecter"}
          </button>
        </div>

      </div>
    </div>
  );
};

const styles = {
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    listStyle: 'none',
    padding: 0,
    margin: '5px 0 0 0'
  },
  dropdownItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s'
  }
};

export default LoginView;