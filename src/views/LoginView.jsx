// src/views/LoginView.jsx
import React, { useState } from 'react';

const LoginView = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. On prépare la requête POST pour la route /login
      const response = await fetch('http://192.168.1.143:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' // On prévient l'API qu'on envoie du JSON
        },
        // 2. On met l'email et le mot de passe dans le "body"
        body: JSON.stringify({
          email: cleanEmail,
          mot_de_passe: password
        })
      });
      
      // 3. Si l'API valide la connexion (souvent un code 200 OK)
      if (response.ok) {
        const rawData = await response.json();
        
        // 1. On gère le cas où c'est un tableau (au cas où)
        let formattedData = Array.isArray(rawData) ? rawData[0] : rawData;
        
        // 2. LE DÉBLOCAGE : On ouvre le tiroir "donnees" si l'API l'a mis dedans !
        const userData = formattedData.donnees ? formattedData.donnees : formattedData;
        
        console.log("🕵️ LE VRAI UTILISATEUR EST :", userData);
        
        // 3. On envoie les vraies infos (qui contiennent direct nom et prenom)
        onLoginSuccess(userData); 
      } else {
        // Si l'API renvoie une erreur (ex: 401 Unauthorized)
        setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
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
          <p>Connexion au panneau de contrôle</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">Adresse Email</label>
            <input 
              type="email" 
              id="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Ex: evan.ollivier44@gmail.com"
              disabled={isLoading}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              disabled={isLoading}
              required 
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <><i className="fa-solid fa-spinner fa-spin"></i> Vérification...</>
            ) : (
              <>Se connecter <i className="fa-solid fa-arrow-right"></i></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;