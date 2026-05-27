// src/views/LoginView.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Composant LoginView
 * Gère l'authentification des utilisateurs (Connexion, Inscription, Récupération de mot de passe).
 * Agit comme un sas de sécurité avant l'accès au tableau de bord.
 */
const LoginView = ({ onLoginSuccess }) => {
  // ÉTATS DE NAVIGATION INTERNE
  // Détermine la vue active : 'login' (connexion), 'register' (inscription), ou 'forgot' (oubli de mot de passe)
  const [viewMode, setViewMode] = useState('login'); 
  // Gère les étapes de la récupération de mot de passe (1: demande email, 2: saisie du code et nouveau mot de passe)
  const [forgotStep, setForgotStep] = useState(1); 

  // ÉTATS DES CHAMPS DE FORMULAIRE
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [resetCode, setResetCode] = useState('');

  // ÉTATS POUR LA RECHERCHE DE COMMUNE (Auto-complétion)
  const [searchCity, setSearchCity] = useState(''); 
  const [cityResults, setCityResults] = useState([]); 
  const [isSearchingCity, setIsSearchingCity] = useState(false); 
  const [showDropdown, setShowDropdown] = useState(false); 
  
  // ÉTATS DE L'INTERFACE UTILISATEUR (UX)
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  // ÉTAT DE SÉCURITÉ : Compte à rebours anti-spam (Cooldown) en secondes
  const [cooldown, setCooldown] = useState(0);

  // 1. CYCLE DE VIE : GESTION DU COOLDOWN (Anti-spam)
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      // Décrémente le compteur chaque seconde
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    // Fonction de nettoyage (cleanup) pour détruire l'intervalle si le composant est démonté
    // ou avant la prochaine exécution du Hook
    return () => clearInterval(timer);
  }, [cooldown]);

  // 2. CYCLE DE VIE : RECHERCHE DE COMMUNE AVEC "DEBOUNCE" (Anti-rebond)
  useEffect(() => {
    // Si la saisie est trop courte ou vide, on réinitialise les résultats
    if (!searchCity || searchCity.trim().length < 2) {
      setCityResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Implémentation d'un délai (debounce) de 300ms.
    // L'appel API n'est déclenché que si l'utilisateur cesse de taper pendant 300ms,
    // ce qui protège le serveur contre une surcharge de requêtes HTTP.
    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingCity(true);
      try {
        // Encodage de la saisie (encodeURIComponent) pour éviter les failles et erreurs d'URL
        const response = await fetch(`http://192.168.1.143:5000/search_city?q=${encodeURIComponent(searchCity)}`);
        if (response.ok) {
          const data = await response.json();
          setCityResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Erreur recherche commune :", err);
      } finally {
        setIsSearchingCity(false);
      }
    }, 300);
    
    // Nettoyage du timeout si l'utilisateur tape une nouvelle lettre avant la fin des 300ms
    return () => clearTimeout(delayDebounceFn);
  }, [searchCity]);

  /**
   * Valide la sélection d'une commune depuis la liste déroulante
   */
  const handleSelectCity = (city) => {
    setSearchCity(city.city_name); 
    setShowDropdown(false); 
    setCityResults([]);
  };

  /**
   * Bascule entre les modes (Connexion, Inscription, Oubli) et réinitialise tous les états
   */
  const switchMode = (mode) => {
    setViewMode(mode);
    setForgotStep(1); 
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setResetCode('');
    setLastName('');
    setFirstName('');
    setSearchCity('');
    setShowDropdown(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCooldown(0); 
  };

  /**
   * Gère la soumission des formulaires d'Inscription et de Connexion
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement natif de la page
    
    // Validation front-end : vérification de la concordance des mots de passe en mode inscription
    if (viewMode === 'register' && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return; // Interruption immédiate (fail-fast)
    }

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase(); // Normalisation de la donnée

    try {
      // BRANCHE : CONNEXION
      if (viewMode === 'login') {
        const response = await fetch('http://192.168.1.143:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: password })
        });
        
        if (response.ok) {
          const rawData = await response.json();
          const userData = rawData.data; 
          // Stockage des informations de session et du jeton JWT dans le stockage local du navigateur
          localStorage.setItem('octo_user', JSON.stringify(userData));
          localStorage.setItem('octo_token', rawData.token);
          toast.success(`Ravi de vous revoir, ${userData.first_name} !`);
          // Remontée d'information vers le composant parent pour changer l'état d'authentification global
          onLoginSuccess(userData); 
        } else {
          toast.error("Identifiants incorrects."); 
        }

      // BRANCHE : INSCRIPTION
      } else if (viewMode === 'register') {
        // Validation front-end de la présence de la commune
        if (!searchCity) {
          toast.warning("Veuillez sélectionner une commune."); 
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://192.168.1.143:5000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            last_name: lastName.trim(),
            first_name: firstName.trim(),
            email: cleanEmail, 
            password: password,
            city_name: searchCity.trim() 
          })
        });

        if (response.ok) {
          toast.success("Compte créé avec succès ! Vous pouvez vous connecter.");
          // Bascule automatique vers l'écran de connexion après un léger délai
          setTimeout(() => switchMode('login'), 2000);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Erreur lors de la création du compte.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau : Impossible de joindre l'API.");
    } finally {
      setIsLoading(false); // Réactivation des boutons
    }
  };

  /**
   * Gère la soumission du processus de récupération de mot de passe (en 2 étapes)
   */
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    
    // Sécurité front-end : empêche l'envoi de requêtes si le cooldown est actif
    if (forgotStep === 1 && cooldown > 0) {
      toast.warning(`Veuillez patienter ${cooldown} secondes avant de renvoyer un email.`);
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // ÉTAPE 1 : Demande d'envoi du code de réinitialisation
      if (forgotStep === 1) {
        const response = await fetch('http://192.168.1.143:5000/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail })
        });
        
        // On affiche un succès même si l'email n'existe pas (protection contre l'énumération de comptes)
        if (response.ok) {
          toast.success("Si le compte existe, un code a été envoyé (valide 15 min) !");
          setForgotStep(2); // Passage à l'étape suivante
          setCooldown(60); // Activation du minuteur anti-spam (60s)
        } else {
          toast.error("Une erreur est survenue.");
        }
        
      // ÉTAPE 2 : Validation du code et enregistrement du nouveau mot de passe
      } else if (forgotStep === 2) {
        if (password !== confirmPassword) {
          toast.error("Les nouveaux mots de passe ne correspondent pas !");
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://192.168.1.143:5000/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, code: resetCode, new_password: password })
        });

        if (response.ok) {
          toast.success("Mot de passe réinitialisé avec succès ! Connectez-vous.");
          setTimeout(() => switchMode('login'), 2000);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Code invalide ou expiré.");
        }
      }
    } catch (err) {
      toast.error("Impossible de joindre le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  // RENDU CONDITIONNEL : VUE "MOT DE PASSE OUBLIÉ"
  if (viewMode === 'forgot') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Octo'System</h2>
            <p>Réinitialisation du mot de passe</p>
          </div>
          
          <form onSubmit={handleForgotSubmit} className="login-form">
            {forgotStep === 1 ? (
              // Formulaire Étape 1 : Saisie de l'email
              <>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  Entrez votre adresse email. Nous vous enverrons un code de sécurité (valide 15 minutes).
                </p>
                <div className="input-group">
                  <label htmlFor="email">Adresse Email</label>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: jean.dupont@email.com" disabled={isLoading} required />
                </div>
              </>
            ) : (
              // Formulaire Étape 2 : Saisie du code et des nouveaux mots de passe
              <>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  Entrez le code reçu par email ainsi que votre nouveau mot de passe.
                </p>
                <div className="input-group">
                  <label htmlFor="resetCode">Code à 6 chiffres</label>
                  <input type="text" id="resetCode" value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="123456" maxLength={6} style={{ letterSpacing: '3px', fontWeight: 'bold', textAlign: 'center' }} disabled={isLoading} required />
                </div>
                <div className="input-group">
                  <label htmlFor="password">Nouveau mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer' }}></i>
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer' }}></i>
                  </div>
                </div>
              </>
            )}

            {/* Bouton de soumission adaptatif (gestion dynamique du texte et de l'état désactivé) */}
            <button 
              type="submit" 
              className="login-btn" 
              disabled={isLoading || (forgotStep === 1 && cooldown > 0)}
              style={{ opacity: (forgotStep === 1 && cooldown > 0) ? 0.6 : 1, cursor: (forgotStep === 1 && cooldown > 0) ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Traitement...</>
              ) : forgotStep === 1 ? (
                cooldown > 0 ? `Renvoyer le code dans ${cooldown}s` : "Envoyer le code"
              ) : (
                "Réinitialiser mon mot de passe"
              )}
            </button>
          </form>

          {/* Option de renvoi du code affichée uniquement à l'étape 2 */}
          {forgotStep === 2 && (
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                 Code non reçu ? 
               </span>
               <button 
                 type="button" 
                 onClick={() => {
                   if (cooldown === 0) setForgotStep(1); // Retourne à l'étape 1 si le cooldown est terminé
                 }} 
                 style={{ 
                   background: 'none', border: 'none', 
                   color: cooldown > 0 ? 'gray' : 'var(--primary)', 
                   fontWeight: 'bold', cursor: cooldown > 0 ? 'not-allowed' : 'pointer', marginLeft: '5px' 
                 }}
                 disabled={cooldown > 0}
               >
                 {cooldown > 0 ? `Patientez ${cooldown}s` : "Renvoyer"}
               </button>
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => switchMode('login')} type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>
              <i className="fa-solid fa-arrow-left"></i> Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDU CONDITIONNEL : VUE "CONNEXION" OU "INSCRIPTION"
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Octo'System</h2>
          {/* Titre dynamique selon le mode actif */}
          <p>{viewMode === 'login' ? "Connexion au panneau de contrôle" : "Création d'un nouveau compte"}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Champs exclusifs au mode Inscription */}
          {viewMode === 'register' && (
            <>
              <div className="input-group">
                <label htmlFor="firstName">Prénom</label>
                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex: Evan" disabled={isLoading} required />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Nom</label>
                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ex: Ollivier" disabled={isLoading} required />
              </div>
              
              {/* Champ Commune avec système d'auto-complétion (Dropdown) */}
              <div className="input-group" style={{ position: 'relative' }}>
                <label htmlFor="searchCity">Commune de résidence</label>
                <input type="text" id="searchCity" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} placeholder="Tapez le nom de votre ville..." disabled={isLoading} autoComplete="off" required />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontStyle: 'italic' }}>Information: Utilisez des tirets pour les noms composés.</small>
                {/* Spinner de chargement affiché pendant la requête HTTP de recherche */}
                {isSearchingCity && <i className="fa-solid fa-spinner fa-spin" style={{ position: 'absolute', right: '15px', top: '40px', color: 'var(--primary)' }}></i>}
                {/* Rendu conditionnel de la liste de résultats */}
                {showDropdown && cityResults.length > 0 && (
                  <ul style={styles.dropdown}>
                    {cityResults.map((city, index) => (
                      <li key={index} style={styles.dropdownItem} onClick={() => handleSelectCity(city)}>{city.city_name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* Champs communs (Email et Mot de passe) */}
          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: jean.dupont@email.com" disabled={isLoading} required />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Mot de passe</label>
              {/* Lien "Mot de passe oublié" affiché uniquement en mode connexion */}
              {viewMode === 'login' && (
                <span onClick={() => switchMode('forgot')} style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                  Mot de passe oublié ?
                </span>
              )}
            </div>
            {/* Champ de mot de passe avec bascule de visibilité (type="text" ou type="password") */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}></i>
            </div>
          </div>

          {/* Champ de confirmation de mot de passe exclusif au mode Inscription */}
          {viewMode === 'register' && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} required style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }} />
                <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}></i>
              </div>
            </div>
          )}

          {/* Bouton de soumission principal avec feedback visuel (spinner) */}
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Traitement...</>
            ) : (
              <>{viewMode === 'login' ? "Se connecter" : "Créer mon compte"} <i className="fa-solid fa-arrow-right"></i></>
            )}
          </button>
        </form>

        {/* Lien de basculement entre les vues Connexion et Inscription */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {viewMode === 'login' ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}
          </span>
          <button onClick={() => switchMode(viewMode === 'login' ? 'register' : 'login')} type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' }}>
            {viewMode === 'login' ? "S'inscrire" : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dictionnaire contenant les styles CSS-in-JS spécifiques au composant d'auto-complétion
const styles = {
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxHeight: '200px', overflowY: 'auto', zIndex: 1000, listStyle: 'none', padding: 0, margin: '5px 0 0 0'
  },
  dropdownItem: {
    padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
    color: 'var(--text-main)', fontSize: '0.9rem', transition: 'background-color 0.2s'
  }
};

export default LoginView;
