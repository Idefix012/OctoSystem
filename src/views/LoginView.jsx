// src/views/LoginView.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const LoginView = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // NOUVEAU : État pour la confirmation
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  
  const [searchCity, setSearchCity] = useState(''); 
  const [cityResults, setCityResults] = useState([]); 
  const [isSearchingCity, setIsSearchingCity] = useState(false); 
  const [showDropdown, setShowDropdown] = useState(false); 
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  // NOUVEAU : État pour l'œil de confirmation
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  useEffect(() => {
    if (!searchCity || searchCity.trim().length < 2) {
      setCityResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearchingCity(true);
      try {
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

    return () => clearTimeout(delayDebounceFn);
  }, [searchCity]);

  const handleSelectCity = (city) => {
    setSearchCity(city.city_name); 
    setShowDropdown(false); 
    setCityResults([]);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
    setConfirmPassword(''); // On vide la confirmation
    setLastName('');
    setFirstName('');
    setSearchCity('');
    setShowDropdown(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleForgotPassword = () => {
    // Fonctionnalité en cours de préparation avec Evan !
    toast.info("La fonction de réinitialisation de mot de passe arrive bientôt !");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // NOUVEAU : Vérification de la confirmation du mot de passe à l'inscription
    if (!isLoginMode && password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas !");
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isLoginMode) {
        const response = await fetch('http://192.168.1.143:5000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: password })
        });
        
        if (response.ok) {
          const rawData = await response.json();
          const userData = rawData.data; 
          
          localStorage.setItem('octo_user', JSON.stringify(userData));
          localStorage.setItem('octo_token', rawData.token);

          toast.success(`Ravi de vous revoir, ${userData.first_name} !`);
          onLoginSuccess(userData); 
        } else {
          toast.error("Identifiants incorrects."); 
        }

      } else {
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
          setTimeout(() => setIsLoginMode(true), 2000);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Erreur lors de la création du compte.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur réseau : Impossible de joindre l'API.");
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
          {!isLoginMode && (
            <>
              <div className="input-group">
                <label htmlFor="firstName">Prénom</label>
                <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ex: Evan" disabled={isLoading} required />
              </div>
              <div className="input-group">
                <label htmlFor="lastName">Nom</label>
                <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Ex: Ollivier" disabled={isLoading} required />
              </div>
              
              <div className="input-group" style={{ position: 'relative' }}>
                <label htmlFor="searchCity">Commune de résidence</label>
                <input 
                  type="text" 
                  id="searchCity"
                  value={searchCity} 
                  onChange={(e) => setSearchCity(e.target.value)} 
                  placeholder="Tapez le nom de votre ville..."
                  disabled={isLoading}
                  autoComplete="off"
                  required 
                />

                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontStyle: 'italic' }}>
                  Information: Utilisez des tirets pour les noms composés (ex:  La trinité sur mer ➡ La trinité-sur-mer).
                </small>
                
                {isSearchingCity && (
                  <i className="fa-solid fa-spinner fa-spin" style={{ position: 'absolute', right: '15px', top: '40px', color: 'var(--primary)' }}></i>
                )}

                {showDropdown && cityResults.length > 0 && (
                  <ul style={styles.dropdown}>
                    {cityResults.map((city, index) => (
                      <li key={index} style={styles.dropdownItem} onClick={() => handleSelectCity(city)}>
                        {city.city_name}
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown && cityResults.length === 0 && searchCity.length >= 2 && !isSearchingCity && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password">Mot de passe</label>
              {/* NOUVEAU : Lien Mot de passe oublié (uniquement en mode connexion) */}
              {isLoginMode && (
                <span onClick={handleForgotPassword} style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}>
                  Mot de passe oublié ?
                </span>
              )}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                disabled={isLoading} 
                required 
                style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
              />
              <i 
                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              ></i>
            </div>
          </div>

          {/* NOUVEAU : Champ de confirmation (uniquement en mode inscription) */}
          {!isLoginMode && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  disabled={isLoading} 
                  required 
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                />
                <i 
                  className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                  title={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                ></i>
              </div>
            </div>
          )}

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